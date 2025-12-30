/**
 * @description 表单联动组件库入口
 * 
 * 基于依赖图的响应式表单联动解决方案
 */

import './index.css';

// ============= 组件导出 =============
export { default as LinkageForm } from './components/LinkageForm';
export { default as LinkageFormItem } from './components/LinkageFormItem';
export { default as LinkageDevTools } from './components/LinkageDevTools';

// ============= 类型导出 =============
export type {
  // 核心类型
  FieldNode,
  FieldState,
  FieldComputeResult,
  LinkageConfig,
  LinkageEngine,
  OptionConfig,
  // 组件 Props 类型
  LinkageFormProps,
  LinkageFormItemProps,
  LinkageContextValue,
} from './types';

// ============= 核心功能导出 =============
export {
  createLinkageEngine,
  buildDependencyGraph,
  getAffectedFields,
  topologicalSort,
  withDebounce,
} from './core/linkageEngine';

// ============= Hooks 导出 =============
export {
  useLinkageEngine,
  createFieldNode,
} from './hooks/useLinkage';

// ============= Context 导出 =============
export {
  LinkageProvider,
  useLinkageContext,
  useFieldState,
  useAllFieldStates,
} from './context/LinkageContext';

// ============= 配置工具导出 =============
export {
  // 示例配置
  basicLinkageConfig,
  cascadingLinkageConfig,
  computedFieldConfig,
  asyncLinkageConfig,
  // 字段创建辅助函数
  createField,
  // 旧版配置转换（向后兼容）
  convertLegacyConfig,
  linkConfig,
} from './config';

// ============= 工具函数导出 =============
export { isArrayWithValue } from './untils';
