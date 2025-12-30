# Antd Form Linkage

<p align="center">
  <img src="https://img.shields.io/npm/v/antd-form-linkage" alt="npm version" />
  <img src="https://img.shields.io/npm/dm/antd-form-linkage" alt="npm downloads" />
  <img src="https://img.shields.io/github/license/your-repo/antd-form-linkage" alt="license" />
</p>

<p align="center">
  🔗 基于依赖图的响应式 Ant Design 表单联动解决方案
</p>

---

## ✨ 特性

- 🎯 **声明式配置** - 使用依赖图描述字段间的联动关系
- ⚡ **级联联动** - 自动拓扑排序，支持 A → B → C 多级联动
- 🔄 **异步支持** - 支持 async/await 异步计算
- 🎨 **丰富效果** - 支持值重置、禁用、隐藏、选项禁用等多种联动效果
- 🐛 **调试工具** - 内置可视化调试面板
- 📦 **TypeScript** - 完整的类型定义
- 🔌 **易于集成** - 与 Ant Design Form 无缝配合

## 📦 安装

```bash
npm install antd-form-linkage

# 或使用 yarn
yarn add antd-form-linkage

# 或使用 pnpm
pnpm add antd-form-linkage
```

### 前置依赖

```json
{
  "peerDependencies": {
    "antd": ">=4.20.1",
    "react": ">=16.8.0",
    "react-dom": ">=16.8.0",
    "lodash": ">=4.17.0"
  }
}
```

## 🚀 快速开始

### 基础用法

```tsx
import { LinkageForm, LinkageFormItem, LinkageConfig } from 'antd-form-linkage';
import { Select, Input } from 'antd';

const linkageConfig: LinkageConfig = {
  fields: [
    {
      name: 'targetField',
      dependencies: ['triggerField'],
      compute: ({ triggerField }) => {
        if (triggerField === 'disable') {
          return { disabled: true };
        }
        if (triggerField === 'hide') {
          return { hidden: true };
        }
        return { disabled: false, hidden: false };
      },
    },
  ],
};

function MyForm() {
  return (
    <LinkageForm linkage={linkageConfig}>
      <LinkageFormItem name="triggerField" label="触发字段">
        <Select
          options={[
            { value: 'normal', label: '正常' },
            { value: 'disable', label: '禁用目标' },
            { value: 'hide', label: '隐藏目标' },
          ]}
        />
      </LinkageFormItem>

      <LinkageFormItem name="targetField" label="目标字段">
        <Input placeholder="这个字段会根据触发字段变化" />
      </LinkageFormItem>
    </LinkageForm>
  );
}
```

### 级联选择（省市区）

```tsx
const linkageConfig: LinkageConfig = {
  fields: [
    {
      name: 'city',
      dependencies: ['province'],
      compute: ({ province }) => ({
        value: undefined, // 省份变化时清空城市
        options: getCityOptions(province),
      }),
    },
    {
      name: 'district',
      dependencies: ['city'],
      compute: ({ city }) => ({
        value: undefined, // 城市变化时清空区县
        options: getDistrictOptions(city),
      }),
    },
  ],
};
```

### 计算字段

```tsx
const linkageConfig: LinkageConfig = {
  fields: [
    {
      name: 'total',
      dependencies: ['price', 'quantity'],
      compute: ({ price, quantity }) => ({
        value: (price || 0) * (quantity || 0),
      }),
    },
    // 总价超过 1000 时显示折扣字段
    {
      name: 'discount',
      dependencies: ['total'],
      compute: ({ total }) => ({
        hidden: total < 1000,
      }),
    },
  ],
};
```

### 异步联动

```tsx
const linkageConfig: LinkageConfig = {
  fields: [
    {
      name: 'userInfo',
      dependencies: ['userId'],
      compute: async ({ userId }) => {
        if (!userId) return { value: null };
        
        const response = await fetch(`/api/users/${userId}`);
        const data = await response.json();
        
        return { value: data };
      },
    },
  ],
};
```

## 📖 API 文档

### LinkageForm

包装了 Ant Design Form，提供联动能力。

| 属性 | 类型 | 描述 |
|------|------|------|
| `linkage` | `LinkageConfig` | 联动配置 |
| `form` | `FormInstance` | Form 实例（可选，不传则内部创建） |
| `...props` | `FormProps` | 其他 Ant Design Form 属性 |

### LinkageFormItem

包装了 Ant Design Form.Item，自动应用联动状态。

| 属性 | 类型 | 描述 |
|------|------|------|
| `name` | `string` | 字段名 |
| `type` | `FormItemType` | 表单项类型，用于智能处理 options |
| `...props` | `FormItemProps` | 其他 Ant Design Form.Item 属性 |

### LinkageDevTools

可视化调试面板。

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `defaultOpen` | `boolean` | `false` | 是否默认展开 |
| `position` | `'bottom-right' \| 'bottom-left' \| 'top-right' \| 'top-left'` | `'bottom-right'` | 位置 |
| `hideInProduction` | `boolean` | `true` | 是否在生产环境隐藏 |

### LinkageConfig

联动配置类型。

```typescript
interface LinkageConfig {
  /** 字段节点列表 */
  fields: FieldNode[];
  
  /** 是否在表单初始化时计算所有字段 */
  computeOnMount?: boolean;
  
  /** 调试模式（在控制台输出日志） */
  debug?: boolean;
}
```

### FieldNode

字段节点定义。

```typescript
interface FieldNode {
  /** 字段名称 */
  name: string;
  
  /** 依赖的字段列表 */
  dependencies?: string[];
  
  /**
   * 计算函数
   * @param deps 依赖字段的当前值
   * @param form antd Form 实例
   * @param allValues 所有表单值
   */
  compute?: (
    deps: Record<string, any>,
    form: FormInstance,
    allValues: Record<string, any>
  ) => FieldComputeResult | Promise<FieldComputeResult>;
  
  /** 是否在初始化时执行 compute */
  computeOnMount?: boolean;
  
  /** 防抖延迟（毫秒） */
  debounce?: number;
}
```

### FieldComputeResult

计算结果类型。

```typescript
interface FieldComputeResult {
  /** 设置字段值 */
  value?: any;
  
  /** 禁用状态 */
  disabled?: boolean;
  
  /** 隐藏状态 */
  hidden?: boolean;
  
  /** 隐藏但仍收集值 */
  hiddenAndSave?: boolean;
  
  /** 选项列表 */
  options?: OptionConfig[];
  
  /** 必填状态 */
  required?: boolean;
}
```

## 🛠️ 辅助函数

提供便捷的字段创建函数：

```tsx
import { createField } from 'antd-form-linkage';

const config: LinkageConfig = {
  fields: [
    // 条件显隐
    createField.conditionalVisible(
      'discount',
      ['total'],
      ({ total }) => total >= 1000
    ),
    
    // 条件禁用
    createField.conditionalDisabled(
      'submit',
      ['agree'],
      ({ agree }) => !agree
    ),
    
    // 计算字段
    createField.computed(
      'total',
      ['price', 'quantity'],
      ({ price, quantity }) => price * quantity
    ),
    
    // 级联重置
    createField.cascadeReset('city', 'province', undefined),
  ],
};
```

## 🔧 Hooks

### useLinkageEngine

创建联动引擎实例：

```tsx
import { useLinkageEngine } from 'antd-form-linkage';

function MyComponent() {
  const [form] = Form.useForm();
  const engine = useLinkageEngine(form, linkageConfig);
  
  // 手动触发重新计算
  const handleRefresh = () => {
    engine?.recompute();
  };
  
  return <Form form={form}>...</Form>;
}
```

### useFieldState

订阅单个字段状态：

```tsx
import { useFieldState } from 'antd-form-linkage';

function MyField() {
  const fieldState = useFieldState('myField');
  
  return (
    <div>
      <p>禁用: {fieldState?.disabled ? '是' : '否'}</p>
      <p>隐藏: {fieldState?.hidden ? '是' : '否'}</p>
    </div>
  );
}
```

## 🐛 调试

### 使用调试面板

```tsx
import { LinkageForm, LinkageFormItem, LinkageDevTools } from 'antd-form-linkage';

function MyForm() {
  return (
    <LinkageForm linkage={{ ...config, debug: true }}>
      <LinkageFormItem name="field1">...</LinkageFormItem>
      
      {/* 添加调试面板 */}
      <LinkageDevTools defaultOpen />
    </LinkageForm>
  );
}
```

### 控制台日志

开启 `debug: true` 后，会在控制台输出详细的联动日志：

```
[Linkage] 值变化: ['province'] { province: 'zhejiang' }
[Linkage] 受影响的字段: ['city', 'district']
[Linkage] 计算顺序: ['city', 'district']
[Linkage] 计算字段: city { province: 'zhejiang' }
[Linkage] 字段状态更新: city { value: undefined, options: [...] }
```

## 🔄 从旧版迁移

如果你使用的是旧版静态配置，可以使用 `convertLegacyConfig` 转换：

```tsx
import { convertLegacyConfig } from 'antd-form-linkage';

// 旧版配置
const oldConfig = {
  activeItem1: {
    2: [
      { formName: 'targetItem1', changeValue: 1, disabled: true },
    ],
  },
};

// 转换为新版配置
const newConfig = convertLegacyConfig(oldConfig);
```

## 📝 完整示例

查看 [Demo 页面](./src/App.tsx) 获取更多示例：

- 🎯 基础联动 - 禁用、隐藏、自动填值
- 🏙️ 级联选择 - 省市区三级联动
- 🧮 计算字段 - 价格计算
- 🔗 多依赖联动 - 个性化推荐
- ✅ 表单验证联动 - 条件必填

## 📄 License

MIT © [Your Name]

---

<p align="center">
  Made with ❤️ for better form experience
</p>
