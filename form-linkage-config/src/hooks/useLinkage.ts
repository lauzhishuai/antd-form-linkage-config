/**
 * @description 联动相关 hooks
 */

import { useRef, useEffect, useMemo } from 'react';
import { FormInstance } from 'antd';
import { createLinkageEngine } from '../core/linkageEngine';
import { LinkageConfig, LinkageEngine } from '../types';

/**
 * 创建联动引擎 Hook
 * 
 * @param form antd Form 实例
 * @param config 联动配置
 * @returns 联动引擎实例
 * 
 * @example
 * ```tsx
 * const [form] = Form.useForm();
 * const engine = useLinkageEngine(form, {
 *   fields: [
 *     {
 *       name: 'city',
 *       dependencies: ['province'],
 *       compute: ({ province }) => ({
 *         value: undefined, // 省份变化时清空城市
 *         options: getCityOptions(province),
 *       }),
 *     },
 *   ],
 * });
 * ```
 */
export function useLinkageEngine(
  form: FormInstance,
  config: LinkageConfig | undefined
): LinkageEngine | null {
  const engineRef = useRef<LinkageEngine | null>(null);

  // 使用 useMemo 确保配置变化时重新创建引擎
  const engine = useMemo(() => {
    if (!config || !form) {
      return null;
    }
    
    // 清理旧引擎
    if (engineRef.current) {
      engineRef.current.reset();
    }
    
    const newEngine = createLinkageEngine(form, config);
    engineRef.current = newEngine;
    return newEngine;
  }, [form, config]);

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      if (engineRef.current) {
        engineRef.current.reset();
      }
    };
  }, []);

  return engine;
}

/**
 * 用于快速创建字段节点的辅助函数
 */
export const createFieldNode = {
  /**
   * 创建级联选择字段（如 省-市-区）
   */
  cascading<T extends string>(
    name: string,
    parentField: string,
    getOptions: (parentValue: any) => any[] | Promise<any[]>
  ) {
    return {
      name,
      dependencies: [parentField],
      compute: async (deps: Record<string, any>) => {
        const parentValue = deps[parentField];
        if (parentValue === undefined || parentValue === null) {
          return { options: [], value: undefined };
        }
        const options = await getOptions(parentValue);
        return { options, value: undefined };
      },
    };
  },

  /**
   * 创建条件显隐字段
   */
  conditionalVisible(
    name: string,
    dependencies: string[],
    condition: (deps: Record<string, any>) => boolean
  ) {
    return {
      name,
      dependencies,
      compute: (deps: Record<string, any>) => ({
        hidden: !condition(deps),
      }),
    };
  },

  /**
   * 创建条件禁用字段
   */
  conditionalDisabled(
    name: string,
    dependencies: string[],
    condition: (deps: Record<string, any>) => boolean
  ) {
    return {
      name,
      dependencies,
      compute: (deps: Record<string, any>) => ({
        disabled: condition(deps),
      }),
    };
  },

  /**
   * 创建计算字段（值由其他字段计算得出）
   */
  computed(
    name: string,
    dependencies: string[],
    computeValue: (deps: Record<string, any>) => any
  ) {
    return {
      name,
      dependencies,
      compute: (deps: Record<string, any>) => ({
        value: computeValue(deps),
      }),
    };
  },

  /**
   * 创建联动重置字段
   */
  resetOnChange(name: string, triggerFields: string[], resetValue: any = undefined) {
    return {
      name,
      dependencies: triggerFields,
      compute: () => ({
        value: resetValue,
      }),
    };
  },
};

export type { LinkageEngine, LinkageConfig };

