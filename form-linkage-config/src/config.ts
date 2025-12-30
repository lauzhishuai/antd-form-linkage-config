/**
 * @description 联动配置示例
 * 展示新版依赖图配置的使用方式
 */

import { LinkageConfig, FieldNode } from './types';

/**
 * 示例：基础联动配置
 * 展示如何使用依赖图方式配置表单联动
 */
export const basicLinkageConfig: LinkageConfig = {
  debug: true, // 开启调试模式
  computeOnMount: true, // 初始化时计算所有字段
  fields: [
    // 示例1：当 activeItem1 变化时，重置 targetItem1 并设置禁用状态
    {
      name: 'targetItem1',
      dependencies: ['activeItem1'],
      compute: ({ activeItem1 }) => {
        if (activeItem1 === 2) {
          return {
            value: 1,
            disabled: true,
            options: [{ value: 1, disabled: true }],
          };
        }
        return {
          disabled: false,
        };
      },
    },

    // 示例2：多依赖 - targetItem2 同时依赖 activeItem1 和 activeItem2
    {
      name: 'targetItem2',
      dependencies: ['activeItem1', 'activeItem2'],
      compute: ({ activeItem1, activeItem2 }) => {
        if (activeItem1 === 2 || activeItem2 === 2) {
          return {
            value: 1,
            options: [{ value: 2, disabled: true }],
          };
        }
        return {};
      },
    },

    // 示例3：条件隐藏
    {
      name: 'targetItem3',
      dependencies: ['activeItem1'],
      compute: ({ activeItem1 }) => ({
        hidden: activeItem1 === 2,
        value: activeItem1 === 2 ? 1 : undefined,
      }),
    },
  ],
};

/**
 * 示例：级联选择配置
 * 展示省市区三级联动
 */
export const cascadingLinkageConfig: LinkageConfig = {
  debug: true,
  fields: [
    {
      name: 'city',
      dependencies: ['province'],
      compute: ({ province }) => {
        // 模拟根据省份获取城市列表
        const cityMap: Record<string, { value: string; label: string }[]> = {
          zhejiang: [
            { value: 'hangzhou', label: '杭州' },
            { value: 'ningbo', label: '宁波' },
          ],
          jiangsu: [
            { value: 'nanjing', label: '南京' },
            { value: 'suzhou', label: '苏州' },
          ],
        };
        return {
          value: undefined, // 省份变化时清空城市
          options: cityMap[province] || [],
        };
      },
    },
    {
      name: 'district',
      dependencies: ['city'],
      compute: ({ city }) => {
        // 模拟根据城市获取区县列表
        const districtMap: Record<string, { value: string; label: string }[]> = {
          hangzhou: [
            { value: 'xihu', label: '西湖区' },
            { value: 'binjiang', label: '滨江区' },
          ],
          nanjing: [
            { value: 'xuanwu', label: '玄武区' },
            { value: 'jianye', label: '建邺区' },
          ],
        };
        return {
          value: undefined, // 城市变化时清空区县
          options: districtMap[city] || [],
        };
      },
    },
  ],
};

/**
 * 示例：计算字段
 * 展示价格 * 数量 = 总价
 */
export const computedFieldConfig: LinkageConfig = {
  fields: [
    {
      name: 'total',
      dependencies: ['price', 'quantity'],
      compute: ({ price, quantity }) => {
        const p = Number(price) || 0;
        const q = Number(quantity) || 0;
        return {
          value: p * q,
        };
      },
    },
    // 当总价超过1000时显示折扣字段
    {
      name: 'discount',
      dependencies: ['total'],
      compute: ({ total }) => ({
        hidden: total < 1000,
      }),
    },
  ],
};

/**
 * 示例：异步联动配置
 * 展示如何进行异步数据加载
 */
export const asyncLinkageConfig: LinkageConfig = {
  debug: true,
  fields: [
    {
      name: 'userInfo',
      dependencies: ['userId'],
      debounce: 300, // 防抖
      compute: async ({ userId }) => {
        if (!userId) {
          return { value: null };
        }
        // 模拟异步请求
        // const response = await fetch(`/api/users/${userId}`);
        // const data = await response.json();
        const data = { name: `User ${userId}`, email: `user${userId}@example.com` };
        return {
          value: data,
        };
      },
    },
  ],
};

/**
 * 辅助函数：创建字段节点
 */
export const createField = {
  /**
   * 创建条件显隐字段
   */
  conditionalVisible: (
    name: string,
    dependencies: string[],
    condition: (deps: Record<string, any>) => boolean
  ): FieldNode => ({
    name,
    dependencies,
    compute: (deps) => ({ hidden: !condition(deps) }),
  }),

  /**
   * 创建条件禁用字段
   */
  conditionalDisabled: (
    name: string,
    dependencies: string[],
    condition: (deps: Record<string, any>) => boolean
  ): FieldNode => ({
    name,
    dependencies,
    compute: (deps) => ({ disabled: condition(deps) }),
  }),

  /**
   * 创建计算字段
   */
  computed: (
    name: string,
    dependencies: string[],
    computeFn: (deps: Record<string, any>) => any
  ): FieldNode => ({
    name,
    dependencies,
    compute: (deps) => ({ value: computeFn(deps) }),
  }),

  /**
   * 创建级联重置字段
   */
  cascadeReset: (name: string, triggerField: string, resetValue: any = undefined): FieldNode => ({
    name,
    dependencies: [triggerField],
    compute: () => ({ value: resetValue }),
  }),
};

// ============= 旧版配置格式（向后兼容）=============

interface OptionItem {
  optionValue: number | string;
  disabled?: boolean;
}

interface LegacyLinkConfigItem {
  formName: string;
  changeValue: any;
  options?: OptionItem[];
  hidden?: boolean;
  disabled?: boolean;
  hiddenAndSave?: boolean;
}

interface LegacyLinkConfigValue {
  [key: string]: LegacyLinkConfigItem[];
}

interface LegacyLinkConfig {
  [key: string]: LegacyLinkConfigValue;
}

/**
 * 旧版配置（向后兼容）
 * @deprecated 请使用新版 LinkageConfig
 */
export const linkConfig: LegacyLinkConfig = {
  activeItem1: {
    2: [
      {
        formName: 'targetItem1',
        changeValue: 1,
        options: [{ optionValue: 1, disabled: true }],
      },
      {
        formName: 'targetItem2',
        changeValue: 1,
      },
      {
        formName: 'targetItem3',
        changeValue: 1,
        hidden: true,
      },
    ],
  },
  activeItem2: {
    2: [
      {
        formName: 'targetItem1',
        changeValue: 2,
      },
      {
        formName: 'targetItem2',
        changeValue: 1,
        options: [{ optionValue: 2, disabled: true }],
      },
    ],
  },
};

/**
 * 转换旧版配置到新版格式
 * @deprecated 仅用于迁移，建议直接使用新版配置
 */
export function convertLegacyConfig(legacy: LegacyLinkConfig): LinkageConfig {
  // 收集所有被联动的字段
  const affectedFields = new Map<string, { triggers: { field: string; value: any; config: LegacyLinkConfigItem }[] }>();

  Object.entries(legacy).forEach(([triggerField, valueConfigs]) => {
    Object.entries(valueConfigs).forEach(([triggerValue, configs]) => {
      configs.forEach((config) => {
        const existing = affectedFields.get(config.formName) || { triggers: [] };
        existing.triggers.push({
          field: triggerField,
          value: triggerValue,
          config,
        });
        affectedFields.set(config.formName, existing);
      });
    });
  });

  // 生成新版字段节点
  const fields: FieldNode[] = [];

  affectedFields.forEach((data, fieldName) => {
    const dependencies = [...new Set(data.triggers.map((t) => t.field))];

    fields.push({
      name: fieldName,
      dependencies,
      compute: (deps) => {
        // 查找匹配的配置
        for (const trigger of data.triggers) {
          if (String(deps[trigger.field]) === String(trigger.value)) {
            const config = trigger.config;
            return {
              value: config.changeValue,
              disabled: config.disabled,
              hidden: config.hidden,
              hiddenAndSave: config.hiddenAndSave,
              options: config.options?.map((o) => ({
                value: o.optionValue,
                disabled: o.disabled,
              })),
            };
          }
        }
        return {};
      },
    });
  });

  return { fields };
}
