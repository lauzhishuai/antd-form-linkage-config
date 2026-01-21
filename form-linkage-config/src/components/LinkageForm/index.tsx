/**
 * @description 联动表单组件
 * 基于依赖图的响应式表单联动
 */
import React, { useCallback, useMemo } from 'react';
import { Form, FormInstance } from 'antd';
import { FormProps } from 'antd/lib/form';
import { LinkageProvider } from '../../context/LinkageContext';
import { useLinkageEngine } from '../../hooks/useLinkage';
import { LinkageConfig } from '../../types';

/**
 * 联动表单 Props
 */
export interface LinkageFormProps extends Omit<FormProps, 'form'> {
  /**
   * 联动配置
   * @example
   * ```tsx
   * linkage={{
   *   fields: [
   *     {
   *       name: 'city',
   *       dependencies: ['province'],
   *       compute: ({ province }) => ({
   *         value: undefined,
   *         options: getCityOptions(province),
   *       }),
   *     },
   *   ],
   *   debug: true,
   * }}
   * ```
   */
  linkage?: LinkageConfig;
  
  /**
   * Form 实例（可选）
   * 如果不传，组件内部会自动创建
   */
  form?: FormInstance;
  
  /**
   * 子组件
   */
  children?: React.ReactNode;
}

/**
 * 联动表单组件
 * 
 * @description
 * 包装了 antd Form，提供基于依赖图的响应式联动能力。
 * 
 * ## 特性
 * - 🔗 声明式依赖关系
 * - ⚡ 级联联动支持
 * - 🔄 异步计算支持
 * - 🐛 调试模式
 * 
 * ## 使用示例
 * 
 * ### 基础用法
 * ```tsx
 * <LinkageForm
 *   linkage={{
 *     fields: [
 *       {
 *         name: 'total',
 *         dependencies: ['price', 'quantity'],
 *         compute: ({ price, quantity }) => ({
 *           value: price * quantity,
 *         }),
 *       },
 *     ],
 *   }}
 * >
 *   <LinkageFormItem name="price" label="单价">
 *     <InputNumber />
 *   </LinkageFormItem>
 *   <LinkageFormItem name="quantity" label="数量">
 *     <InputNumber />
 *   </LinkageFormItem>
 *   <LinkageFormItem name="total" label="总价">
 *     <InputNumber disabled />
 *   </LinkageFormItem>
 * </LinkageForm>
 * ```
 * 
 * ### 级联选择
 * ```tsx
 * <LinkageForm
 *   linkage={{
 *     fields: [
 *       {
 *         name: 'city',
 *         dependencies: ['province'],
 *         compute: async ({ province }) => ({
 *           value: undefined,
 *           options: await fetchCities(province),
 *         }),
 *       },
 *       {
 *         name: 'district',
 *         dependencies: ['city'],
 *         compute: async ({ city }) => ({
 *           value: undefined,
 *           options: await fetchDistricts(city),
 *         }),
 *       },
 *     ],
 *   }}
 * >
 *   ...
 * </LinkageForm>
 * ```
 */
const LinkageForm: React.FC<LinkageFormProps> = (props) => {
  const {
    linkage,
    form: propForm,
    onValuesChange,
    children,
    ...restProps
  } = props;

  // 如果外部没有传 form，内部创建一个
  const [internalForm] = Form.useForm();
  const form = propForm || internalForm;

  // 创建联动引擎
  const engine = useLinkageEngine(form, linkage);

  // 处理值变化
  const handleValuesChange = useCallback(
    async (changedValues: Record<string, any>, allValues: Record<string, any>) => {
      // 1. 先执行联动逻辑
      if (engine) {
        await engine.handleChange(changedValues, allValues);
      }

      // 2. 调用用户的 onValuesChange
      if (onValuesChange) {
        // 获取更新后的值
        const updatedValues = form.getFieldsValue(true);
        onValuesChange(changedValues, updatedValues);
      }
    },
    [engine, onValuesChange, form]
  );

  // 获取 debug 模式
  const debug = linkage?.debug ?? false;

  return (
    <LinkageProvider engine={engine} debug={debug}>
      <Form {...restProps} form={form} onValuesChange={handleValuesChange}>
    {children}
  </Form>
    </LinkageProvider>
  );
};

// 导出组件
export default LinkageForm;

// 导出类型
export type { LinkageConfig };
