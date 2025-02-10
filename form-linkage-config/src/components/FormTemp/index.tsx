/**
 * @description:  antd form 封装，onValuesChange 处理联动逻辑
 */
import React from 'react'
import { Form, FormInstance } from 'antd'
import { FormProps } from 'antd/lib/form'
import { isArrayWithValue } from '../../untils'

interface OptionItem {
  optionValue: number | string
  disabled?: boolean
}

export interface LinkConfigItem {
  formName: string;
  changeValue: any;
  options?: OptionItem[];
  hidden?: boolean;
  disabled?: boolean;
  hiddenAndSave?: boolean;
}

interface LinkConfigObj {
  [key: string]: LinkConfigItem[]
}

interface LinkConfig {
  [key: string]: LinkConfigObj
}

interface FormTempProps extends FormProps {
  linkConfig?: LinkConfig;
  children: React.ReactNode;
  onActiveItemChange?: (val: LinkConfigItem[]) => void
}

interface ChildProps {
  template: LinkConfigItem[];
}

const FormTemp: React.FC<FormTempProps> = (props: FormTempProps) => {
  console.log('FormTempProps', props.children)
  console.log('FormTempProps', React.isValidElement(props.children))
  // const [finalLinkConfig, setFinalLinkConfig] = useState<LinkConfigItem[]>([]);

  const { linkConfig, onValuesChange, children, onActiveItemChange, ...restProps } = props;
  // if (!children) return null;
  const { form } = restProps as { form: FormInstance };
  const { getFieldValue } = form
  const activeFormNameList = linkConfig ? Object.keys(linkConfig) : []

  // 最终处理完的联动配置
  // let finalLinkConfig: LinkConfigItem[] = []

  /* 聚合被联动字段的配置
  表单值changeValue: 正常多个字段联动被联动字段，设置的值应该是不冲突的（否则是配置有问题）。设置当前change项对应的changeValue
  表单项禁用disabled：一个为true即为true
  表单项隐藏hidden：一个为true即为true
  表单项隐藏但收集hiddenAndSave：一个为true即为true
  表单可选项options{disabled}：一个为true即为true
  configList: 所有主联动字段在当前选中下的配置（待合并）
*/
  const mergeLinkConfig = (config: LinkConfigItem[]) => {
    try {
      // 被联动表单项名称，用于记录已经合并的表单项
      const configList = JSON.parse(JSON.stringify(config)) // 深拷贝，避免对内层原始配置数据的修改
      const formNameList = new Set<string>()
      const result = configList.reduce((prev: LinkConfigItem[], next: LinkConfigItem) => {
        // 相同formName的配置项做合并
        if (formNameList.has(next?.formName)) {
          const existingConfig = prev.find(item => item.formName === next?.formName)
          if (existingConfig) {
            existingConfig.disabled = existingConfig?.disabled || next?.disabled
            existingConfig.hidden = existingConfig?.hidden || next?.hidden
            existingConfig.hiddenAndSave = existingConfig?.hiddenAndSave || next?.hiddenAndSave
            // 合并options
            if (next?.options) {
              const tempOptions = existingConfig?.options || []
              const nextOptions = next?.options || []
              if (isArrayWithValue(tempOptions)) {
                const options = tempOptions.map((item) => {
                  const nextItem = nextOptions.find(nextItem => nextItem.optionValue === item.optionValue)
                  if (nextItem) {
                    return {
                      ...item,
                      disabled: item?.disabled || nextItem?.disabled,
                    }
                  }
                  return item
                })
                existingConfig.options = options
              } else {
                existingConfig.options = nextOptions
              }
            }
          }
        } else {
          // 没有相同formName的配置项直接推入
          formNameList.add(next?.formName)
          prev.push({ ...next })
        }
        return prev
      }, [])
      return result || []
    } catch (error) {
      console.error('mergeLinkConfig error', error)
      return []
    }
  }

  // 获取配置，依据主联动字段生成模板组件需要的配置
  const getLinkConfig = () => {
    try {
      if (linkConfig) {
        const activeFormValueList = activeFormNameList.map(item => ({ [item]: form.getFieldValue(item) }));
        const activeFormItemConfigList: LinkConfigItem[] = [];

        activeFormValueList.forEach((item) => {
          const [key, value] = Object.entries(item)[0];
          const tempKeyConfig = linkConfig[key];
          const tempKeyValueConfig = tempKeyConfig?.[value] || [];

          // 确保 tempKeyValueConfig 是数组
          if (Array.isArray(tempKeyValueConfig)) {
            activeFormItemConfigList.push(...tempKeyValueConfig);
          }
        });

        return mergeLinkConfig(activeFormItemConfigList);
      }
      return [];
    } catch (error) {
      console.error('getLinkConfig error', error);
      return [];
    }
  };

  const onValuesChangeTemp = (changedValues: any, allValues: any) => {
    // 处理联动逻辑
    if (linkConfig) {
      try {
        console.log('changedValues', changedValues)
        // const testConfig = JSON.parse(JSON.stringify(testConfig11))
        // 1.获取当前change项对应的联动配置
        const changedFormName: string = Object.keys(changedValues)[0]
        const config = linkConfig[changedFormName]
        if (config) {
          const changedFormValue = getFieldValue(changedFormName)
          const curVConfig = config?.[changedFormValue] || []
          console.log('curVConfig', curVConfig)

          // 2.重置被联动字段值
          if (isArrayWithValue(curVConfig)) {
            curVConfig.forEach(item => {
              const { formName, changeValue } = item
              form.setFieldsValue({ [formName]: changeValue })
              // todo：是否需要递推联动，目前项目无改场景，同时也为了避免死循环暂时不递推。后续看场景，如果有递推联动需求，再做处理，这是需要注意联动配置不能有死循环。不建议产品需求设计为这种及联方式，后期会难以维护。
            })
          }
        }

        // 3.获取全局模板配置（用于设置禁用、隐藏逻辑）
        // 这里需要获取全局的配置项，所有主联动字段的配置合并为一份配置
        const finConfig = getLinkConfig()
        // setFinalLinkConfig(finConfig)
        // console.log('finConfig', finalLinkConfig)
        onActiveItemChange && onActiveItemChange(finConfig)
      } catch (error) {
        console.error('onFormValuesChange error', error)
      }
    }
    onValuesChange && onValuesChange?.(changedValues, allValues)
  }

  /* 递归遍历children,为FormItemTemp组件注入template配置 */
  // const renderChildren = (children: React.ReactNode): React.ReactNode => {
  //   console.log('children', children)
  //   return React.Children.map(children, child => {
  //     if (!React.isValidElement(child)) {
  //       return child;
  //     }

  //     if (isArrayWithValue(child?.props?.dependencies)) {
  //       debugger
  //       const tempChild = child.props.children
  //       if (typeof tempChild === 'function') {
  //         const childComponent = tempChild as () => React.ReactNode;
  //         console.log('childComponent', childComponent)
  //         return renderChildren(childComponent());
  //       }
  //     }

  //     // 判断是否为FormItemTemp组件
  //     if (isObject(child.type) && child.type.name === 'FormItemTemp') {
  //       // debugger
  //       return React.cloneElement(child, {
  //         template: finalLinkConfig,
  //         required: true
  //       } as ChildProps);
  //     }

  //     // 递归处理子节点
  //     if (React.isValidElement(child?.props?.children)) {
  //       const newChildren = renderChildren(child.props.children);
  //       return React.cloneElement(child, {}, newChildren);
  //     }

  //     return child;
  //   });
  // }

  return <Form {...restProps} onValuesChange={onValuesChangeTemp}>
    {children}
  </Form>
}

export default FormTemp
