/**
 * @description 联动引擎核心逻辑
 * 基于依赖图实现响应式表单联动
 */

import { FormInstance } from 'antd';
import {
  FieldNode,
  FieldState,
  LinkageConfig,
  LinkageEngine,
  LinkageEngineState,
  FieldComputeResult,
} from '../types';

/**
 * 构建依赖图
 * @param fields 字段节点列表
 * @returns 依赖图和反向依赖图
 */
export function buildDependencyGraph(fields: FieldNode[]): {
  dependencyGraph: Map<string, Set<string>>;
  reverseDependencyGraph: Map<string, Set<string>>;
} {
  // 正向依赖图：字段 A 被改变时，哪些字段需要重新计算
  const dependencyGraph = new Map<string, Set<string>>();
  // 反向依赖图：字段 A 依赖哪些字段
  const reverseDependencyGraph = new Map<string, Set<string>>();

  fields.forEach((node) => {
    const { name, dependencies = [] } = node;

    // 初始化
    if (!reverseDependencyGraph.has(name)) {
      reverseDependencyGraph.set(name, new Set());
    }

    dependencies.forEach((dep) => {
      // 正向：dep 变化时，name 需要重新计算
      if (!dependencyGraph.has(dep)) {
        dependencyGraph.set(dep, new Set());
      }
      dependencyGraph.get(dep)!.add(name);

      // 反向：name 依赖 dep
      reverseDependencyGraph.get(name)!.add(dep);
    });
  });

  return { dependencyGraph, reverseDependencyGraph };
}

/**
 * 获取所有受影响的字段（BFS 广度优先遍历依赖图）
 * @param changedFields 发生变化的字段
 * @param graph 依赖图
 * @returns 所有受影响的字段集合
 */
export function getAffectedFields(
  changedFields: string[],
  graph: Map<string, Set<string>>
): Set<string> {
  const affected = new Set<string>();
  const queue = [...changedFields];

  while (queue.length > 0) {
    const current = queue.shift()!;
    const dependents = graph.get(current);

    if (dependents) {
      dependents.forEach((dep) => {
        if (!affected.has(dep)) {
          affected.add(dep);
          queue.push(dep);
        }
      });
    }
  }

  return affected;
}

/**
 * 拓扑排序
 * 确保依赖的字段先计算
 * @param fields 需要排序的字段
 * @param reverseGraph 反向依赖图
 * @returns 排序后的字段列表
 */
export function topologicalSort(
  fields: Set<string>,
  reverseGraph: Map<string, Set<string>>
): string[] {
  const result: string[] = [];
  const visited = new Set<string>();
  const visiting = new Set<string>(); // 用于检测循环依赖

  function visit(field: string) {
    if (visited.has(field)) return;
    if (visiting.has(field)) {
      console.warn(`[Linkage] 检测到循环依赖，跳过字段: ${field}`);
      return;
    }

    visiting.add(field);

    // 先访问依赖的字段
    const deps = reverseGraph.get(field);
    if (deps) {
      deps.forEach((dep) => {
        if (fields.has(dep)) {
          visit(dep);
        }
      });
    }

    visiting.delete(field);
    visited.add(field);
    result.push(field);
  }

  fields.forEach((field) => visit(field));

  return result;
}

/**
 * 获取依赖字段的值
 */
function getDepsValues(
  dependencies: string[] | undefined,
  allValues: Record<string, any>
): Record<string, any> {
  if (!dependencies || dependencies.length === 0) {
    return {};
  }

  const result: Record<string, any> = {};
  dependencies.forEach((dep) => {
    result[dep] = allValues[dep];
  });
  return result;
}

/**
 * 创建联动引擎
 */
export function createLinkageEngine(
  form: FormInstance,
  config: LinkageConfig
): LinkageEngine {
  const { fields, debug = false } = config;

  // 构建依赖图
  const { dependencyGraph, reverseDependencyGraph } = buildDependencyGraph(fields);

  // 字段节点映射
  const nodeMap = new Map<string, FieldNode>(fields.map((n) => [n.name, n]));

  // 运行时状态
  const state: LinkageEngineState = {
    fieldStates: new Map(),
    dependencyGraph,
    reverseDependencyGraph,
  };

  // 订阅者列表
  const listeners = new Set<(states: Map<string, FieldState>) => void>();

  // 防抖定时器
  const debounceTimers = new Map<string, NodeJS.Timeout>();

  /**
   * 通知所有订阅者
   */
  function notifyListeners() {
    listeners.forEach((listener) => {
      listener(new Map(state.fieldStates));
    });
  }

  /**
   * 更新字段状态
   */
  function updateFieldState(name: string, updates: Partial<FieldState>) {
    const currentState = state.fieldStates.get(name) || { name };
    state.fieldStates.set(name, { ...currentState, ...updates });

    if (debug) {
      console.log(`[Linkage] 字段状态更新: ${name}`, updates);
    }
  }

  /**
   * 执行单个字段的计算
   */
  async function computeField(
    fieldName: string,
    allValues: Record<string, any>
  ): Promise<FieldComputeResult | null> {
    const node = nodeMap.get(fieldName);
    if (!node?.compute) return null;

    // 获取所依赖字段的当前值
    const deps = getDepsValues(node.dependencies, allValues);

    if (debug) {
      console.log(`[Linkage] 计算字段: ${fieldName}`, { deps, allValues });
    }

    try {
      updateFieldState(fieldName, { loading: true, error: undefined });
      // 执行联动函数，result即联动后产出的disabled、hidden、hiddenAndSave、options、required、rules等
      const result = await node.compute(deps, form, allValues);
      updateFieldState(fieldName, { ...result, loading: false });
      return result;
    } catch (error) {
      console.error(`[Linkage] 计算字段 ${fieldName} 出错:`, error);
      updateFieldState(fieldName, { loading: false, error: error as Error });
      return null;
    }
  }

  /**
   * 批量计算字段（按拓扑顺序）
   */
  async function computeFields(
    fieldNames: string[],
    allValues: Record<string, any>
  ): Promise<Record<string, any>> {
    const valuesToSet: Record<string, any> = {};
    let currentValues = { ...allValues };

    for (const fieldName of fieldNames) {
      const result = await computeField(fieldName, currentValues);

      if (result) {
        // 如果计算结果包含 value，记录下来并更新当前值（供后续字段计算使用）
        if (result.value !== undefined) {
          valuesToSet[fieldName] = result.value;
          currentValues[fieldName] = result.value;
        }
      }
    }

    return valuesToSet;
  }

  /**
   * 处理值变化（核心入口） 
   */
  async function handleChange(
    changedValues: Record<string, any>,
    allValues: Record<string, any>
  ): Promise<void> {
    const changedFields = Object.keys(changedValues);

    if (debug) {
      console.log('[Linkage] 值变化:', changedFields, changedValues);
    }

    // 1. 获取所有受影响的字段
    const affected = getAffectedFields(changedFields, dependencyGraph);

    if (affected.size === 0) {
      if (debug) {
        console.log('[Linkage] 没有受影响的字段');
      }
      notifyListeners();
      return;
    }

    if (debug) {
      console.log('[Linkage] 受影响的字段:', Array.from(affected));
    }

    // 2. 拓扑排序
    const sortedFields = topologicalSort(affected, reverseDependencyGraph);

    if (debug) {
      console.log('[Linkage] 计算顺序:', sortedFields);
    }

    // 3. 按顺序计算，处理级联更新(更新各字段的联动状态，返回待更新的表单值)
    const valuesToSet = await computeFields(sortedFields, allValues);

    // 4. 批量更新表单值
    if (Object.keys(valuesToSet).length > 0) {
      if (debug) {
        console.log('[Linkage] 批量更新值:', valuesToSet);
      }
      form.setFieldsValue(valuesToSet);
    }

    // 5. 通知订阅者
    notifyListeners();
  }

  /**
   * 获取字段状态
   */
  function getFieldState(name: string): FieldState | undefined {
    return state.fieldStates.get(name);
  }

  /**
   * 获取所有字段状态
   */
  function getAllFieldStates(): Map<string, FieldState> {
    return new Map(state.fieldStates);
  }

  /**
   * 手动触发重新计算
   */
  async function recompute(fieldNames?: string[]): Promise<void> {
    const allValues = form.getFieldsValue(true);
    const targetFields = fieldNames || Array.from(nodeMap.keys());

    // 获取所有受影响的字段
    const affected = new Set(targetFields);
    targetFields.forEach((field) => {
      const deps = getAffectedFields([field], dependencyGraph);
      deps.forEach((d) => affected.add(d));
    });

    const sortedFields = topologicalSort(affected, reverseDependencyGraph);
    const valuesToSet = await computeFields(sortedFields, allValues);

    if (Object.keys(valuesToSet).length > 0) {
      form.setFieldsValue(valuesToSet);
    }

    notifyListeners();
  }

  /**
   * 重置状态
   */
  function reset(): void {
    state.fieldStates.clear();
    debounceTimers.forEach((timer) => clearTimeout(timer));
    debounceTimers.clear();
    notifyListeners();
  }

  /**
   * 订阅状态变化
   */
  function subscribe(
    listener: (states: Map<string, FieldState>) => void
  ): () => void {
    //listener:每个表单项中配置的回调函数(allStates) => {setState(allStates.get(name))})
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }

  // 初始化：如果配置了 computeOnMount，在初始化时计算所有字段
  if (config.computeOnMount) {
    // 延迟执行，确保表单已经初始化
    setTimeout(() => {
      recompute();
    }, 0);
  }

  return {
    handleChange,
    getFieldState,
    getAllFieldStates,
    recompute,
    reset,
    subscribe,
  };
}

/**
 * 创建带防抖的计算函数
 */
export function withDebounce<T extends (...args: any[]) => Promise<FieldComputeResult>>(
  fn: T,
  delay: number
): T {
  let timer: NodeJS.Timeout | null = null;
  let resolveQueue: ((value: FieldComputeResult) => void)[] = [];

  return (async (...args: Parameters<T>) => {
    return new Promise<FieldComputeResult>((resolve) => {
      resolveQueue.push(resolve);

      if (timer) {
        clearTimeout(timer);
      }

      timer = setTimeout(async () => {
        const result = await fn(...args);
        resolveQueue.forEach((r) => r(result));
        resolveQueue = [];
        timer = null;
      }, delay);
    });
  }) as T;
}

