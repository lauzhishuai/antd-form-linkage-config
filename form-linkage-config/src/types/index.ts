/**
 * @description 联动配置类型定义
 * 基于依赖图的响应式联动架构
 */

import { FormInstance } from 'antd';

/**
 * 字段联动计算结果
 */
export interface FieldComputeResult {
  /** 设置字段值 */
  value?: any;
  /** 禁用状态 */
  disabled?: boolean;
  /** 隐藏状态 */
  hidden?: boolean;
  /** 隐藏但仍收集值 */
  hiddenAndSave?: boolean;
  /** 选项列表（用于 Select/Radio/Checkbox 等） */
  options?: OptionConfig[];
  /** 必填状态 */
  required?: boolean;
  /** 校验规则 */
  rules?: any[];
}

/**
 * 选项配置
 */
export interface OptionConfig {
  /** 选项值 */
  value: string | number;
  /** 选项标签 */
  label?: React.ReactNode;
  /** 禁用状态 */
  disabled?: boolean;
  /** 隐藏状态 */
  hidden?: boolean;
  /** 子选项（用于级联选择、树选择等） */
  children?: OptionConfig[];
}

/**
 * 字段节点定义
 * 描述一个表单字段的依赖关系和计算逻辑
 */
export interface FieldNode {
  /** 字段名称（对应 Form.Item 的 name） */
  name: string;
  
  /** 依赖的字段列表 */
  dependencies?: string[];
  
  /**
   * 计算函数 - 当依赖字段变化时触发
   * @param deps 依赖字段的当前值
   * @param form antd Form 实例
   * @param allValues 所有表单值
   * @returns 计算结果（可以是同步或异步）
   */
  compute?: (
    deps: Record<string, any>,
    form: FormInstance,
    allValues: Record<string, any>
  ) => FieldComputeResult | Promise<FieldComputeResult>;
  
  /** 是否在初始化时执行 compute */
  computeOnMount?: boolean;
  
  /** 防抖延迟（毫秒），用于异步计算 */
  debounce?: number;
}

/**
 * 联动配置
 */
export interface LinkageConfig {
  /** 字段节点列表 */
  fields: FieldNode[];
  
  /** 是否在表单初始化时计算所有字段 */
  computeOnMount?: boolean;
  
  /** 调试模式 */
  debug?: boolean;
}

/**
 * 字段状态（运行时）
 */
export interface FieldState extends FieldComputeResult {
  /** 字段名 */
  name: string;
  /** 是否正在计算中（异步场景） */
  loading?: boolean;
  /** 计算错误 */
  error?: Error;
}

/**
 * 联动引擎状态
 */
export interface LinkageEngineState {
  /** 所有字段状态 */
  fieldStates: Map<string, FieldState>;
  /** 依赖图：field -> 依赖它的字段列表 */
  dependencyGraph: Map<string, Set<string>>;
  /** 反向依赖图：field -> 它依赖的字段列表 */
  reverseDependencyGraph: Map<string, Set<string>>;
}

/**
 * 联动引擎接口
 */
export interface LinkageEngine {
  /** 处理字段值变化 */
  handleChange: (changedValues: Record<string, any>, allValues: Record<string, any>) => Promise<void>;
  
  /** 获取字段状态 */
  getFieldState: (name: string) => FieldState | undefined;
  
  /** 获取所有字段状态 */
  getAllFieldStates: () => Map<string, FieldState>;
  
  /** 获取依赖图 */
  getGraphs: () => {
    dependencyGraph: Map<string, Set<string>>;
    reverseDependencyGraph: Map<string, Set<string>>;
  };

  /** 手动触发字段重新计算 */
  recompute: (fieldNames?: string[]) => Promise<void>;
  
  /** 重置所有状态 */
  reset: () => void;
  
  /** 订阅状态变化 */
  subscribe: (listener: (states: Map<string, FieldState>) => void) => () => void;
}

/**
 * Context 值类型
 */
export interface LinkageContextValue {
  /** 联动引擎实例 */
  engine: LinkageEngine | null;
  
  /** 获取字段配置 */
  getFieldState: (name: string) => FieldState | undefined;
  
  /** 调试模式 */
  debug?: boolean;
}

/**
 * LinkageForm Props
 */
export interface LinkageFormProps {
  /** 联动配置 */
  linkage?: LinkageConfig;
  
  /** Form 实例（可选，不传则内部创建） */
  form?: FormInstance;
  
  /** 子组件 */
  children?: React.ReactNode;
  
  /** 值变化回调 */
  onValuesChange?: (changedValues: any, allValues: any) => void;
  
  /** 其他 antd Form props */
  [key: string]: any;
}

/**
 * LinkageFormItem Props
 */
export interface LinkageFormItemProps {
  /** 字段名 */
  name: string;
  
  /** 表单项类型（用于智能处理 options） */
  type?: 'Input' | 'Select' | 'DatePicker' | 'Cascader' | 'TreeSelect' | 
         'CheckAllCheckBox' | 'Radio' | 'Checkbox' | 'UploadButton' | 
         'MultiCategory' | 'RadioCheckBoxComb';
  
  /** 子组件 */
  children?: React.ReactNode;
  
  /** 标签 */
  label?: React.ReactNode;
  
  /** 样式 */
  style?: React.CSSProperties;
  
  /** 其他 antd Form.Item props */
  [key: string]: any;
}

