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

- 🎯 **声明式配置** - 使用依赖图描述字段间的联动关系，告别繁琐的命令式代码
- ⚡ **级联联动** - 自动拓扑排序，支持 A → B → C 多级联动链
- 🔄 **异步支持** - 原生支持 async/await，轻松处理远程数据加载
- 🎨 **丰富效果** - 支持值重置、禁用、隐藏、选项禁用、必填状态等多种联动效果
- 🐛 **调试工具** - 内置可视化调试面板，实时查看联动状态
- 📦 **TypeScript** - 完整的类型定义，提供良好的开发体验
- 🔌 **易于集成** - 与 Ant Design Form 无缝配合，零学习成本

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

// 1. 定义联动配置
const linkageConfig: LinkageConfig = {
  debug: true, // 开启调试模式
  fields: [
    {
      name: 'targetField',           // 受控字段名
      dependencies: ['triggerField'], // 依赖的字段
      compute: ({ triggerField }) => {
        // 根据触发字段的值，返回受控字段的状态
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

// 2. 使用组件
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

### 级联选择（省市区三级联动）

```tsx
const linkageConfig: LinkageConfig = {
  fields: [
    {
      name: 'city',
      dependencies: ['province'],
      compute: ({ province }) => ({
        value: undefined, // 省份变化时清空城市
        options: getCityOptions(province), // 根据省份获取城市列表
      }),
    },
    {
      name: 'district',
      dependencies: ['city'],
      compute: ({ city }) => ({
        value: undefined, // 城市变化时清空区县
        options: getDistrictOptions(city), // 根据城市获取区县列表
      }),
    },
  ],
};
```

### 计算字段

```tsx
const linkageConfig: LinkageConfig = {
  fields: [
    // 自动计算总价
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
        
        // 异步获取用户信息
        const response = await fetch(`/api/users/${userId}`);
        const data = await response.json();
        
        return { value: data };
      },
    },
  ],
};
```

## 📖 API 文档

### LinkageForm 组件

包装了 Ant Design Form，提供联动能力。

```tsx
<LinkageForm
  linkage={linkageConfig}  // 联动配置
  form={form}              // 可选，Form 实例
  onValuesChange={...}     // 值变化回调
  {...otherFormProps}      // 其他 antd Form 属性
>
  {children}
</LinkageForm>
```

| 属性 | 类型 | 必填 | 描述 |
|------|------|------|------|
| `linkage` | `LinkageConfig` | 否 | 联动配置 |
| `form` | `FormInstance` | 否 | Form 实例，不传则内部创建 |
| `...props` | `FormProps` | - | 其他 Ant Design Form 属性 |

### LinkageFormItem 组件

包装了 Ant Design Form.Item，自动应用联动状态。

```tsx
<LinkageFormItem
  name="fieldName"    // 字段名
  type="Select"       // 可选，表单项类型
  label="字段标签"
  {...otherFormItemProps}
>
  <Select options={...} />
</LinkageFormItem>
```

| 属性 | 类型 | 必填 | 描述 |
|------|------|------|------|
| `name` | `string` | 是 | 字段名 |
| `type` | `FormItemType` | 否 | 表单项类型，用于智能处理 options |
| `...props` | `FormItemProps` | - | 其他 Ant Design Form.Item 属性 |

支持的 `type` 值：
- `Input` / `Select` / `DatePicker` / `Cascader` / `TreeSelect`
- `Radio` / `Checkbox` / `UploadButton`
- `CheckAllCheckBox` / `MultiCategory` / `RadioCheckBoxComb`

### LinkageDevTools 调试面板

可视化调试面板，帮助开发调试联动逻辑。

```tsx
<LinkageForm linkage={config}>
  {/* 表单项 */}
  <LinkageDevTools defaultOpen position="bottom-right" />
</LinkageForm>
```

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `defaultOpen` | `boolean` | `false` | 是否默认展开 |
| `position` | `string` | `'bottom-right'` | 位置：`bottom-right` / `bottom-left` / `top-right` / `top-left` |
| `hideInProduction` | `boolean` | `true` | 是否在生产环境隐藏 |

### LinkageConfig 配置类型

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

### FieldNode 字段节点

```typescript
interface FieldNode {
  /** 字段名称（对应 Form.Item 的 name） */
  name: string;
  
  /** 依赖的字段列表 */
  dependencies?: string[];
  
  /**
   * 计算函数 - 当依赖字段变化时触发
   * @param deps 依赖字段的当前值
   * @param form antd Form 实例
   * @param allValues 所有表单值
   * @returns 计算结果（支持 Promise）
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

### FieldComputeResult 计算结果

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
  
  /** 选项列表（用于 Select/Radio/Checkbox 等） */
  options?: OptionConfig[];
  
  /** 必填状态 */
  required?: boolean;
}
```

## 🛠️ 辅助函数

提供便捷的字段创建函数，简化常见场景：

```tsx
import { createField } from 'antd-form-linkage';

const config: LinkageConfig = {
  fields: [
    // 1. 条件显隐 - 总价 >= 1000 时显示折扣字段
    createField.conditionalVisible(
      'discount',              // 字段名
      ['total'],               // 依赖字段
      ({ total }) => total >= 1000  // 显示条件
    ),
    
    // 2. 条件禁用 - 未勾选同意时禁用提交按钮
    createField.conditionalDisabled(
      'submit',
      ['agree'],
      ({ agree }) => !agree
    ),
    
    // 3. 计算字段 - 自动计算总价
    createField.computed(
      'total',
      ['price', 'quantity'],
      ({ price, quantity }) => price * quantity
    ),
    
    // 4. 级联重置 - 省份变化时清空城市
    createField.cascadeReset('city', 'province', undefined),
  ],
};
```

## 🔧 Hooks API

### useLinkageEngine

创建联动引擎实例，用于自定义场景：

```tsx
import { useLinkageEngine } from 'antd-form-linkage';

function MyComponent() {
  const [form] = Form.useForm();
  const engine = useLinkageEngine(form, linkageConfig);
  
  // 手动触发重新计算
  const handleRefresh = () => {
    engine?.recompute();
  };
  
  // 获取字段状态
  const fieldState = engine?.getFieldState('myField');
  
  return <Form form={form}>...</Form>;
}
```

### useFieldState

订阅单个字段的联动状态：

```tsx
import { useFieldState } from 'antd-form-linkage';

function FieldStatus({ name }: { name: string }) {
  const fieldState = useFieldState(name);
  
  return (
    <div>
      <p>字段: {name}</p>
      <p>禁用: {fieldState?.disabled ? '是' : '否'}</p>
      <p>隐藏: {fieldState?.hidden ? '是' : '否'}</p>
      <p>加载中: {fieldState?.loading ? '是' : '否'}</p>
    </div>
  );
}
```

### useAllFieldStates

订阅所有字段的联动状态：

```tsx
import { useAllFieldStates } from 'antd-form-linkage';

function AllFieldsStatus() {
  const allStates = useAllFieldStates();
  
  return (
    <ul>
      {Array.from(allStates.entries()).map(([name, state]) => (
        <li key={name}>{name}: {JSON.stringify(state)}</li>
      ))}
    </ul>
  );
}
```

## 🐛 调试指南

### 方式一：使用调试面板

```tsx
import { LinkageDevTools } from 'antd-form-linkage';

<LinkageForm linkage={{ ...config, debug: true }}>
  {/* 表单项 */}
  <LinkageDevTools defaultOpen />
</LinkageForm>
```

调试面板功能：
- 📊 实时显示所有字段的联动状态
- 🔍 展开查看详细信息（value、options 等）
- 🎯 状态标签快速识别（禁用、隐藏、加载中）
- 🐛 错误信息展示

### 方式二：控制台日志

开启 `debug: true` 后，会在控制台输出详细日志：

```
[Linkage] 值变化: ['province'] { province: 'zhejiang' }
[Linkage] 受影响的字段: ['city', 'district']
[Linkage] 计算顺序: ['city', 'district']
[Linkage] 计算字段: city { province: 'zhejiang' }
[Linkage] 字段状态更新: city { value: undefined, options: [...] }
[Linkage] 批量更新值: { city: undefined }
```

## 🔄 从旧版迁移

如果你之前使用的是旧版静态配置格式，可以使用 `convertLegacyConfig` 一键转换：

```tsx
import { convertLegacyConfig } from 'antd-form-linkage';

// 旧版配置格式
const oldConfig = {
  activeItem1: {
    2: [
      { formName: 'targetItem1', changeValue: 1, disabled: true },
      { formName: 'targetItem2', changeValue: undefined, hidden: true },
    ],
  },
};

// 转换为新版配置
const newConfig = convertLegacyConfig(oldConfig);

// 使用新配置
<LinkageForm linkage={newConfig}>...</LinkageForm>
```

## 📝 完整示例

项目包含了丰富的示例，运行查看：

```bash
cd form-linkage-config
npm install
npm run dev
```

示例包括：
- 🎯 **基础联动** - 禁用、隐藏、自动填值、选项禁用
- 🏙️ **级联选择** - 省市区三级联动
- 🧮 **计算字段** - 价格计算、条件显示
- 🔗 **多依赖联动** - 一个字段依赖多个字段
- ✅ **表单验证联动** - 条件必填、密码确认

## 🏗️ 架构设计

```
┌─────────────────────────────────────────────────────────┐
│                    LinkageForm                          │
│  ┌─────────────────────────────────────────────────────│
│  │                LinkageProvider                       │
│  │  ┌───────────────────────────────────────────────── │
│  │  │              LinkageEngine                       │
│  │  │  ┌─────────────────────────────────────────────  │
│  │  │  │  依赖图 (Dependency Graph)                    │
│  │  │  │  ┌─────┐    ┌─────┐    ┌─────┐               │
│  │  │  │  │  A  │───▶│  B  │───▶│  C  │               │
│  │  │  │  └─────┘    └─────┘    └─────┘               │
│  │  │  │       拓扑排序 → 按序计算 → 批量更新          │
│  │  │  └─────────────────────────────────────────────  │
│  │  └───────────────────────────────────────────────── │
│  │                                                      │
│  │  ┌────────────────┐  ┌────────────────┐             │
│  │  │LinkageFormItem │  │LinkageFormItem │  ...        │
│  │  │  useFieldState │  │  useFieldState │             │
│  │  └────────────────┘  └────────────────┘             │
│  └─────────────────────────────────────────────────────│
└─────────────────────────────────────────────────────────┘
```

核心流程：
1. **值变化** → 触发 `onValuesChange`
2. **查找依赖** → BFS 遍历依赖图，找出所有受影响字段
3. **拓扑排序** → 确保依赖的字段先计算
4. **按序计算** → 执行 compute 函数，支持异步
5. **批量更新** → 合并所有更新，一次性应用

## 📄 License

MIT © [Your Name]

---

<p align="center">
  Made with ❤️ for better form experience
</p>

