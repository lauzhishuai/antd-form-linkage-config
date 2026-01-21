/**
 * @description 联动表单项组件
 * 自动根据联动引擎的状态设置表单项属性
 */
import React, { useMemo } from 'react';
import { Form } from 'antd';
import { FormItemProps } from 'antd/lib/form';
import { cloneDeep } from 'lodash';
import { useFieldState } from '../../context/LinkageContext';
import { OptionConfig, FieldState } from '../../types';

/**
 * 表单项类型
 */
export type FormItemType =
  | 'Input'
  | 'Select'
  | 'DatePicker'
  | 'Cascader'
  | 'TreeSelect'
  | 'CheckAllCheckBox'
  | 'Radio'
  | 'Checkbox'
  | 'UploadButton'
  | 'MultiCategory'
  | 'RadioCheckBoxComb';

/**
 * 联动表单项 Props
 */
export interface LinkageFormItemProps extends FormItemProps {
  /**
   * 字段名
   */
  name: string;

  /**
   * 表单项类型
   * 用于智能处理 options 的禁用状态
   */
  type?: FormItemType;

  /**
   * 子组件
   */
  children?: React.ReactNode;

  /**
   * 是否为编辑模式
   * 编辑模式下不会设置初始值
   */
  isEdit?: boolean;
}

/**
 * 合并选项配置
 * 将联动配置的 options 合并到组件的 options 中
 */
function mergeOptions(
  componentOptions: any[] | undefined,
  configOptions: OptionConfig[] | undefined,
  keyField: string = 'value'
): any[] | undefined {
  if (!configOptions || configOptions.length === 0) {
    return componentOptions;
  }

  // 如果组件没有提供 options，则直接返回组件空options
  if (!componentOptions || componentOptions.length === 0) {
    return componentOptions;
  }

  const optionsCopy = cloneDeep(componentOptions);

  return optionsCopy
    .map((item) => {
    const config = configOptions.find((c) => c.value === item[keyField]);
    if (config) {
      if (config.hidden) {
        return null;
      }
      return {
        ...item,
        disabled: config.disabled ?? item.disabled,
        children: mergeOptions(item.children, config.children, keyField),
      };
    }
    return item;
  })
    .filter(Boolean);
}

/**
 * 包装子组件，应用联动状态
 */
function wrapChildren(
  children: React.ReactNode,
  fieldState: FieldState | undefined,
  type?: FormItemType
): React.ReactNode {
  if (!React.isValidElement(children) || !fieldState) {
    return children;
  }

  const { disabled, options: configOptions } = fieldState;
  const childProps: Record<string, any> = {};

  // 1. 处理 disabled
  if (disabled !== undefined) {
    childProps.disabled = disabled;
  }

  // 2. 处理 options
  if (configOptions && configOptions.length > 0) {
    const existingOptions = children.props.options;
    const existingTreeData = children.props.treeData;

    // 只对已存在的 options/treeData 做“禁用/隐藏”合并，不注入新 options
    if (existingOptions !== undefined) {
      // Select, Radio.Group, Checkbox.Group 等使用 options 属性
      childProps.options = mergeOptions(existingOptions, configOptions);
    } else if (existingTreeData !== undefined) {
      // TreeSelect 使用 treeData 属性
      childProps.treeData = mergeOptions(existingTreeData, configOptions);
    }
  }

  // 3. 处理 children 形式的选项（如 <Select.Option /> / <Radio /> / <Checkbox />）
  if (
    configOptions &&
    configOptions.length > 0 &&
    children.props.children &&
    (type === 'Select' || type === 'Radio' || type === 'Checkbox')
  ) {
    const configMap = new Map(
      configOptions.map((item) => [item.value, item])
    );

    const clonedChildren = React.Children.map(children.props.children, (child) => {
      if (!React.isValidElement(child)) return child;
      const childProps = child.props as { value?: string | number; disabled?: boolean };
      const value = childProps.value;
      if (value === undefined) return child;
      const config = configMap.get(value);
      if (!config) return child;
      if (config.hidden) return null;
      return React.cloneElement(child as React.ReactElement<any>, {
        disabled: config.disabled ?? childProps.disabled,
      });
    });

    childProps.children = clonedChildren;
  }

  // 如果没有需要更新的属性，直接返回原组件
  if (Object.keys(childProps).length === 0) {
    return children;
  }

  return React.cloneElement(children, childProps);
}

/**
 * 联动表单项组件
 *
 * @description
 * 自动从联动上下文获取字段状态，并应用到表单项和子组件上。
 *
 * ## 支持的联动效果
 * - `hidden`: 隐藏表单项
 * - `disabled`: 禁用表单项
 * - `value`: 设置字段值（通过引擎处理）
 * - `options`: 设置选项列表的禁用状态
 * - `required`: 设置必填状态
 *
 * ## 使用示例
 *
 * ```tsx
 * <LinkageFormItem name="city" label="城市" type="Select">
 *   <Select options={cityOptions} />
 * </LinkageFormItem>
 * ```
 *
 * 当联动引擎计算出 city 字段需要隐藏时，该表单项会自动隐藏。
 * 当计算出某些选项需要禁用时，会自动合并到 Select 的 options 中。
 */
const LinkageFormItem: React.FC<LinkageFormItemProps> = (props) => {
  const { name, type, children, isEdit, hidden, ...restProps } = props;

  // LinkageContext.tsx 第 65-86 行
  /* 
  export function useFieldState(name: string) {
    const { engine } = useLinkageContext();
    const [state, setState] = useState();

    useEffect(() => {
      // 🔑 关键：注册订阅，当引擎状态变化时更新组件状态
      const unsubscribe = engine.subscribe((allStates) => {
       // 这是个回掉函数listener，当引擎状态变化时使用notifyListeners调用回调通知所有订阅者
        setState(allStates.get(name));  // 只取自己关心的字段
      });

      return unsubscribe;  // 组件卸载时取消订阅
    }, [engine, name]);

    return state;
  }
  */
  // 从联动上下文获取字段状态（配置状态并订阅状态变化）
  const fieldState = useFieldState(name);

  // 计算表单项属性
  const formItemProps = useMemo(() => {
    const result: Partial<FormItemProps> = {};

    if (fieldState) {
      // 隐藏状态
      if (fieldState.hidden !== undefined) {
        result.hidden = fieldState.hidden;
      }

      // hiddenAndSave: 隐藏但仍收集值
      if (fieldState.hiddenAndSave) {
        result.hidden = true;
      }

      // 必填状态
      if (fieldState.required !== undefined) {
        result.required = fieldState.required;
      }
    }

    return result;
  }, [fieldState]);

  // 包装子组件
  const wrappedChildren = useMemo(() => {
    return wrapChildren(children, fieldState, type);
  }, [children, fieldState, type]);

  // 处理隐藏样式（使用 className 实现隐藏但保留 DOM）
  const hiddenClass =
    (hidden || formItemProps.hidden) && !fieldState?.hiddenAndSave
      ? 'formitem-template-hidden'
      : '';

  return (
    <Form.Item
      name={name}
      {...restProps}
      {...formItemProps}
      className={`${props.className || ''} ${hiddenClass}`.trim()}
    >
      {wrappedChildren}
    </Form.Item>
  );
};

export default LinkageFormItem;

// 导出类型
export type { OptionConfig, FieldState };
