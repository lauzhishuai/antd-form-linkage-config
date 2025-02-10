/**
 * @description: 定制化表单项(antd4&antd3)
 * Input/TextArea/DatePicker：hidden/disabled/初始值
 * Select：表单项的hidden/disabled/初始值；数据项：disabled
 * Cascader: 表单项的hidden/disabled/初始值; 数据项：disabled
 * TreeSelect: 表单项的hidden/disabled/初始值；数据项disabled（主活动中disabled设置了自定义class，导致disabeld被隐藏）
 * CheckAllCheckBox(带有全选功能的自定义多选组件): 表单项的hidden/disabled/初始值；数据项disabled
 * MultiCategory(类目组件)：表单项的hidden/disabled/初始值；数据项的disabled；切换不限单选按钮的disabled/初始值（disabled 通过在选项中增加options配置，partial：部分类目；nolimit：不限）
 */
// import { Form as Form_3, } from '@ant-design/compatible'
// import { GetFieldDecoratorOptions, WrappedFormUtils } from '@ant-design/compatible/lib/form/Form'
import { Form as Form_4, Select, Radio, Checkbox } from 'antd'
import { CascaderProps } from 'antd/lib/cascader'
import { FormItemProps } from 'antd/lib/form'
import { TreeSelectProps } from 'antd/lib/tree-select'
import { isNil, cloneDeep, isString, isBoolean } from 'lodash'
import React from 'react'

import { isArrayWithValue } from '../../untils'

// import { tempConfigJson } from '../constants'

interface OptionsType {
  optionValue: string | number
  disabled?: boolean
  children?: OptionsType[]
}

interface Option {
  value: string | number
  label?: React.ReactNode
  disabled?: boolean
  children?: Option[]
  isLeaf?: boolean
}

export interface FormItemConfigType {
  formName: string
  defaultValue?: string | number | Array<string | number | Record<string, unknown>> | boolean | undefined
  disabled?: boolean
  hidden?: boolean
  options?: OptionsType[]
  hiddenAndSave?: boolean // 隐藏但收集表单值
}

// 表单Item需要添加的配置属性
interface FormAddPropsType {
  initialValue?: number | string | Array<number | string | Record<string, unknown>> | boolean | undefined
  hidden?: boolean
}
// 表单元素需要添加的配置属性
interface AddConfigPropsType {
  disabled?: boolean
}

interface GetTempFieldDecoratorOptions {
  name: string // 表单name
  label?: React.ReactNode// 表单名称
  // form: WrappedFormUtils // antd3需要传，用于构建表单
  type: 'Input' | 'Select' | 'DatePicker' | 'Cascader' | 'TreeSelect' | 'CheckAllCheckBox' | 'Radio' | 'Checkbox' | 'UploadButton' | 'MultiCategory' | 'RadioCheckBoxComb' // 表单项类型
  isEdit?: boolean // 是否是编辑状态
  style?: React.CSSProperties
  template: FormItemConfigType[] | undefined
  dataFormat?: (value: any) => any
}

export interface TempFormItemProps extends FormItemProps {
  type: 'Input' | 'Select' | 'DatePicker' | 'Cascader' | 'TreeSelect' | 'CheckAllCheckBox' | 'Radio' | 'Checkbox' | 'UploadButton' | 'MultiCategory' | 'RadioCheckBoxComb' // 表单项类型
  isEdit?: boolean // 是否是编辑状态
  style?: React.CSSProperties
  template: FormItemConfigType[] | undefined
  dataFormat?: (value: any) => any
}

const setTreeDataDisabled = (treeData: TreeSelectProps<string | number>['treeData']) => {
  if (!treeData) {
    return treeData
  }
  return treeData.map((node) => ({
    ...node,
    disabled: true,
    children: setTreeDataDisabled(node?.children),
  }))
}

const updateTreeDataWithConfig = (treeData: TreeSelectProps<string | number>['treeData'], config?: OptionsType[]) => {

  if (!treeData || !config) {
    return treeData
  }

  return treeData.map((node) => {
    const nodeConfig = config.find(i => i.optionValue === node.value)

    if (node.value === nodeConfig?.optionValue && nodeConfig?.disabled === true) {
      return {
        ...node,
        disabled: nodeConfig?.disabled,
        children: setTreeDataDisabled(node?.children),
      }
    }

    if (node.children && nodeConfig?.children) {
      return {
        ...node,
        children: updateTreeDataWithConfig(node.children, nodeConfig?.children),
      }
    }

    return node

  })


}

// 基础 Props 类型
interface BaseChildProps {
  value: any;
  disabled?: boolean;
  children?: React.ReactNode;
}

// 添加更详细的类型定义
interface RadioProps extends BaseChildProps {
  type?: 'radio';
}

interface SelectOptionProps extends BaseChildProps {
  type?: 'select';
}

interface CheckboxProps extends BaseChildProps {
  type?: 'checkbox';
}

// 通用的渲染子元素方法
const renderChild = <T extends BaseChildProps>(child: React.ReactElement<T>, disabled?: boolean) => {
  if (!React.isValidElement(child)) return child;

  const newProps = {
    ...child.props,
    disabled: disabled ?? child.props.disabled
  } as T;

  return React.cloneElement(child, newProps);
};

const FormItemTemp: React.FC<GetTempFieldDecoratorOptions | TempFormItemProps> = props => {
  console.log('FormItemTempProps', props)

  // 服务端给的数据都是JSON串，需要转换成对应类型
  const JSONParseValue = (value) => {
    if (value === 'undefined') {
      return undefined
    }
    if (isString(value)) {
      try {
        return JSON.parse(value)
      } catch (error) {
        return value
      }
    }
    return value
  }

  // 树形结构options配置模版属性
  const getTreeOptionsWithConfig = (
    options: CascaderProps<Option>['options'] | TreeSelectProps<number | string>['treeData'] = [],
    configOptions: OptionsType[]
  ) => {
    const copyOptions = cloneDeep(options) // 树形结构，深拷贝

    const treeOptionsWithConfig = copyOptions.map(item => {
      const config = configOptions.find(i => i.optionValue === item.value)
      if (config?.disabled === true) {
        // eslint-disable-next-line no-param-reassign
        item.disabled = config?.disabled // 设置当前项disabled
      }
      if (item.children && config?.children && isArrayWithValue(item.children) && isArrayWithValue(config?.children)) {
        // eslint-disable-next-line no-param-reassign
        item.children = getTreeOptionsWithConfig(item.children, config.children)
      }
      return item
    })

    return treeOptionsWithConfig
  }

  const itemTempConfig = (props.template || []).find(item => item.formName === props.name)
  // console.log('formItemTempConfig', itemTempConfig)

  // 树形options value 格式化
  const JSONParseTreeValue = (value: OptionsType[]) => {
    const parseValue = (value || []).map(item => ({
      ...item,
      optionValue: JSONParseValue(item.optionValue),
      children: (item.children && isArrayWithValue(item.children)) ? JSONParseTreeValue(item.children) : item.children
    }))
    return parseValue
  }

  // /* antd3 */
  // if ('form' in props) {
  //   const { form, type, isEdit, name, label, children, style = {}, dataFormat, ...others } = props
  //   if (!React.isValidElement(children)) return null
  //   if (!name) return null
  //   const { getFieldDecorator } = form || {}
  //   const Form = Form_3
  //   /* antd3匹配到模版配置 */
  //   if (itemTempConfig) {
  //     const { defaultValue: tempDefaultValue, disabled: tempDisabled, hidden: tempHidden, options: tempOptions = [] } = itemTempConfig
  //     const defaultValue = JSONParseValue(tempDefaultValue)
  //     const disabled = JSONParseValue(tempDisabled)
  //     const hidden = JSONParseValue(tempHidden)
  //     const options = tempOptions ? JSONParseTreeValue(tempOptions) : JSONParseValue(tempOptions)

  //     const formAddProps: GetFieldDecoratorOptions = {}
  //     if (!isEdit && !isNil(defaultValue) && type !== 'DatePicker' && type !== 'UploadButton') {
  //       // 需要考虑number要不要转成string
  //       formAddProps.initialValue = defaultValue
  //     }

  //     const addProps: AddConfigPropsType = {}
  //     // 设置了合法的disabled属性
  //     if (disabled === true) {
  //       addProps.disabled = disabled
  //     }

  //     // console.log('addProps', addProps)
  //     // Input/DatePicker
  //     if (type === 'Input' || type === 'DatePicker') {
  //       return (
  //         <Form.Item label={label} style={style} className={hidden && type === 'Input' ? 'formitem-template-hidden' : ''}>
  //           {getFieldDecorator(name.toString(), {
  //             ...others,
  //             ...formAddProps
  //           })(
  //             // <Input {...children.props} {...addProps} />
  //             React.cloneElement(children, { ...addProps })
  //           )}
  //         </Form.Item>
  //       )
  //     }
  //     // Select
  //     if (type === 'Select') {
  //       // React.Children.map(children.props.children, child => console.log('child', child))
  //       return (
  //         <Form.Item label={label} style={style} className={hidden ? 'formitem-template-hidden' : ''}>
  //           {getFieldDecorator(name.toString(), {
  //             ...others,
  //             ...formAddProps
  //           })(
  //             <Select {...children.props} {...addProps}>
  //               {React.Children.map(children.props.children, child => {
  //                 const childDisabled = options.find(item => item.optionValue === child?.props?.value)
  //                 if (childDisabled !== undefined) {
  //                   return React.cloneElement(child, { disabled: childDisabled?.disabled })
  //                 }
  //                 return React.cloneElement(child)
  //               }
  //               )}
  //             </Select>
  //           )}
  //         </Form.Item>
  //       )
  //     }
  //     // Cascader
  //     if (type === 'Cascader') {
  //       const { options: casOptions } = children.props || {}
  //       const casOptionsWithDisaled = getTreeOptionsWithConfig(casOptions, options)
  //       const addCasOptions = { options: isArrayWithValue(casOptionsWithDisaled) ? casOptionsWithDisaled : [] }

  //       return (
  //         <Form.Item label={label} style={style} className={hidden ? 'formitem-template-hidden' : ''}>
  //           {getFieldDecorator(name.toString(), {
  //             ...others,
  //             ...formAddProps,
  //           })(
  //             React.cloneElement(children, { ...addProps, ...addCasOptions })
  //           )}
  //         </Form.Item>
  //       )
  //     }
  //     // TreeSelect
  //     if (type === 'TreeSelect') {
  //       const { treeData } = children.props || {}
  //       const treeDataWithDisaled = updateTreeDataWithConfig(treeData, options)
  //       let formattedTreeDataWithDisabled = treeDataWithDisaled
  //       if (typeof dataFormat === 'function') {
  //         formattedTreeDataWithDisabled = dataFormat(treeDataWithDisaled)
  //       }
  //       const addTreeData = { treeData: isArrayWithValue(formattedTreeDataWithDisabled) ? formattedTreeDataWithDisabled : [] }

  //       return (
  //         <Form.Item label={label} style={style} className={hidden ? 'formitem-template-hidden' : ''}>
  //           {getFieldDecorator(name.toString(), {
  //             ...others,
  //             ...formAddProps,
  //           })(
  //             React.cloneElement(children, { ...addProps, ...addTreeData })
  //           )}
  //         </Form.Item>
  //       )
  //     }
  //     // CheckAllCheckBox自定义组件
  //     if (type === 'CheckAllCheckBox') {
  //       // 处理options
  //       const { options: checkBoxOptions = [] } = children.props || {}
  //       const copyCheckBoxOptions = cloneDeep(checkBoxOptions)
  //       const checkBoxOptionsWithDisabled = (copyCheckBoxOptions || []).map(item => {
  //         const config = options.find(i => i.optionValue === item.value)
  //         if (config?.disabled === true) {
  //           // eslint-disable-next-line no-param-reassign
  //           item.disabled = config.disabled
  //           return item
  //         }
  //         return item
  //       })
  //       const addOptions = { options: isArrayWithValue(checkBoxOptionsWithDisabled) ? checkBoxOptionsWithDisabled : [] }
  //       // console.log('CheckAllCheckBox', addOptions)

  //       return (
  //         <Form.Item label={label} style={style} className={hidden ? 'formitem-template-hidden' : ''}>
  //           {getFieldDecorator(name.toString(), {
  //             ...others,
  //             ...formAddProps
  //           })(
  //             React.cloneElement(children, { ...addOptions, ...addProps })
  //           )}
  //         </Form.Item>
  //       )
  //     }
  //     // Radio
  //     if (type === 'Radio') {
  //       return <Form.Item label={label} style={style} className={hidden ? 'formitem-template-hidden' : ''}>
  //         {getFieldDecorator(name.toString(), {
  //           ...others,
  //           ...formAddProps
  //         })(
  //           <Radio.Group {...children.props} {...addProps}>
  //             {React.Children.map(children.props.children, child => {
  //               const childDisabled = options.find(item => item.optionValue === child?.props?.value) // 存在number&string类型混合情况，统一量纲处理
  //               if (childDisabled?.disabled) {
  //                 return React.cloneElement(child, { disabled: true })
  //               }
  //               return React.cloneElement(child)
  //             })}
  //           </Radio.Group>
  //           // React.cloneElement(children, { ...addProps })
  //         )}
  //       </Form.Item>
  //     }
  //     // MultiCategory
  //     if (type === 'MultiCategory') {
  //       // 设置类目组件单选按钮和类目多选框disabled
  //       const radioDisabled = options.filter(item => (item.optionValue === 'nolimit' || item.optionValue === 'partial') && item?.disabled).map(item => item.optionValue)
  //       const optionsWithDisabled = options.filter(item => item.optionValue !== 'nolimit' && item.optionValue !== 'partial' && item?.disabled).map(item => item?.optionValue)
  //       const otherAddProps = { radioDisabled, optionsDisabled: optionsWithDisabled }
  //       return (
  //         <Form.Item label={label} style={style} className={hidden ? 'formitem-template-hidden' : ''}>
  //           {getFieldDecorator(name.toString(), {
  //             ...others,
  //             ...formAddProps,
  //           })(
  //             React.cloneElement(children, { ...addProps, ...otherAddProps })
  //           )}
  //         </Form.Item>
  //       )

  //     }
  //     // Checkbox
  //     if (type === 'Checkbox') {
  //       return <Form.Item label={label} style={style} className={hidden ? 'formitem-template-hidden' : ''}>
  //         {getFieldDecorator(name.toString(), {
  //           ...others,
  //           ...formAddProps
  //         })(
  //           <Checkbox.Group {...children.props} {...addProps}>
  //             {React.Children.map(children.props.children, child => {
  //               const childDisabled = options.find(item => item.optionValue === child?.props?.value)
  //               if (childDisabled?.disabled) {
  //                 return React.cloneElement(child, { disabled: true })
  //               }
  //               return React.cloneElement(child)
  //             })}
  //           </Checkbox.Group>
  //           // React.cloneElement(children, { ...addProps })
  //         )}
  //       </Form.Item>
  //     }
  //     // UploadButton
  //     if (type === 'UploadButton') {
  //       return <Form.Item label={label} style={style}>
  //         {getFieldDecorator(name.toString(), {
  //           ...others,
  //           ...formAddProps
  //         })(
  //           React.cloneElement(children, { ...addProps })
  //         )}
  //       </Form.Item>
  //     }

  //     // RadioCheckBoxComb
  //     if (type === 'RadioCheckBoxComb') {
  //       const optDisabledStr = options.filter(item => item?.disabled).map(item => item.optionValue).join()
  //       const otherAddProps = { optDisabledStr }
  //       return (
  //         <Form.Item label={label} style={style} className={hidden ? 'formitem-template-hidden' : ''}>
  //           {getFieldDecorator(name.toString(), {
  //             ...others,
  //             ...formAddProps,
  //           })(
  //             React.cloneElement(children, { ...addProps, ...otherAddProps })
  //           )}
  //         </Form.Item>
  //       )
  //     }
  //   }

  //   /* antd3未匹配到模板 */
  //   return (
  //     <Form.Item label={label} style={style}>
  //       {getFieldDecorator(name.toString(), {
  //         ...others
  //       })(
  //         children
  //       )}
  //     </Form.Item>
  //   )
  // }

  /* antd4 */
  const { type, isEdit, name, label, children, style = {}, dataFormat, ...others } = props
  if (!React.isValidElement(children)) return null
  const Form = Form_4
  /* antd4匹配到模板 */
  if (itemTempConfig) {
    const {
      defaultValue: tempDefaultValue,
      disabled: tempDisabled,
      hidden: tempHidden,
      options: tempOptions = [],
      hiddenAndSave,
    } = itemTempConfig
    const defaultValue = JSONParseValue(tempDefaultValue)
    const disabled = JSONParseValue(tempDisabled)
    const hidden = JSONParseValue(tempHidden)
    const hiddenAndSaveValue = JSONParseValue(hiddenAndSave)
    const options = tempOptions ? JSONParseTreeValue(tempOptions) : JSONParseValue(tempOptions)

    const formAddProps: FormAddPropsType = {}
    // DatePicker组件不支持设置初始值
    if (!isEdit && !isNil(defaultValue) && type !== 'DatePicker') {
      formAddProps.initialValue = defaultValue
    }
    if (isBoolean(hiddenAndSaveValue)) {
      formAddProps.hidden = hiddenAndSaveValue
    }
    const addProps: AddConfigPropsType = {}
    // 设置了合法的disabled属性
    if (disabled === true) {
      addProps.disabled = disabled
    }

    if (type === 'Input' || type === 'DatePicker') {
      return <Form.Item name={name} label={label} {...others} {...formAddProps} style={style} className={hidden && type === 'Input' ? 'formitem-template-hidden' : ''}>
        {React.cloneElement(children, { ...children.props, ...addProps })}
      </Form.Item>
    }
    if (type === 'Select') {
      const { options: selOptions = [] } = children.props || {}
      const copySelOptions = cloneDeep(selOptions)
      // 区分是否optinos配置
      if (isArrayWithValue(copySelOptions)) {
        // 配置模板options设置
        const selOptionsWithDisaled = (copySelOptions || []).map(item => {
          const config = options.find(i => i.optionValue === item.value)
          if (config && config?.disabled === true) {
            // eslint-disable-next-line no-param-reassign
            item.disabled = config.disabled
            return item
          }
          return item
        })
        const addSelOptions = { options: isArrayWithValue(selOptionsWithDisaled) ? selOptionsWithDisaled : [] }
        return <Form.Item name={name} label={label} style={style} {...others} {...formAddProps} className={hidden ? 'formitem-template-hidden' : ''}>
          {React.cloneElement(children, { ...addSelOptions, ...addProps })}
        </Form.Item>
      }
      return <Form.Item name={name} label={label} style={style} {...others} {...formAddProps} className={hidden ? 'formitem-template-hidden' : ''}>
        <Select {...children.props} {...addProps}>
          {React.Children.map(children.props.children, child => {
            const childDisabled = options.find(item => item.optionValue === child?.props?.value)
            if (childDisabled?.disabled === true) {
              return React.cloneElement(child, { disabled: childDisabled?.disabled })
            }
            return React.cloneElement(child)
          })}
        </Select>
      </Form.Item>
    }
    if (type === 'Cascader') {
      const { options: casOptions } = children.props || {}
      const casOptionsWithDisaled = getTreeOptionsWithConfig(casOptions, options)
      const addCasOptions = { options: isArrayWithValue(casOptionsWithDisaled) ? casOptionsWithDisaled : [] }
      // console.log('cascaderOptions', addCasOptions)

      return (
        <Form.Item name={name} label={label} style={style} {...others} {...formAddProps} className={hidden ? 'formitem-template-hidden' : ''}>
          {React.cloneElement(children, { ...addCasOptions, ...addProps })}
        </Form.Item>
      )
    }
    if (type === 'TreeSelect') {
      const { treeData } = children.props || {}
      const treeDataWithDisaled = updateTreeDataWithConfig(treeData, options)

      let formattedTreeDataWithDisabled = treeDataWithDisaled
      if (typeof dataFormat === 'function') {
        formattedTreeDataWithDisabled = dataFormat(treeDataWithDisaled)
      }

      const addTreeData = { treeData: isArrayWithValue(formattedTreeDataWithDisabled) ? formattedTreeDataWithDisabled : [] }

      return (
        <Form.Item name={name} label={label} style={style} {...others} {...formAddProps} className={hidden ? 'formitem-template-hidden' : ''}>
          {React.cloneElement(children, { ...addTreeData, ...addProps })}
        </Form.Item>
      )
    }
    if (type === 'CheckAllCheckBox') {
      const { options: checkBoxOptions = [] } = children.props || {}
      const copyCheckBoxOptions = cloneDeep(checkBoxOptions)
      const checkBoxOptionsWithDisabled = (copyCheckBoxOptions || []).map(item => {
        const config = options.find(i => i.optionValue === item.value)
        if (config?.disabled === true) {
          // eslint-disable-next-line no-param-reassign
          item.disabled = config.disabled
          return item
        }
        return item
      })
      const addOptions = { options: isArrayWithValue(checkBoxOptionsWithDisabled) ? checkBoxOptionsWithDisabled : [] }

      return <Form.Item name={name} label={label} style={style} {...others} {...formAddProps} className={hidden ? 'formitem-template-hidden' : ''}>
        {React.cloneElement(children, { ...addOptions, ...addProps })}
      </Form.Item>
    }
    if (type === 'Radio') {
      const { options: radioOptions = [] } = children.props || {}
      const copyRadioOptions = cloneDeep(radioOptions)
      // 区分是否optinos配置
      if (isArrayWithValue(copyRadioOptions)) {
        // 配置模板options设置
        const radioOptionsWithDisaled = (copyRadioOptions || []).map(item => {
          const config = options.find(i => i.optionValue === item.value)
          if (config?.disabled === true) {
            // eslint-disable-next-line no-param-reassign
            item.disabled = config.disabled
            return item
          }
          return item
        })
        const addRadioOptions = { options: isArrayWithValue(radioOptionsWithDisaled) ? radioOptionsWithDisaled : [] }
        return <Form.Item name={name} label={label} style={style} {...others} {...formAddProps} className={hidden ? 'formitem-template-hidden' : ''}>
          {React.cloneElement(children, { ...addRadioOptions, ...addProps })}
        </Form.Item>
      }
      return <Form.Item name={name} label={label} style={style} {...others} {...formAddProps} className={hidden ? 'formitem-template-hidden' : ''}>
        <Radio.Group {...children.props} {...addProps}>
          {React.Children.map(children.props.children, child => {
            const childDisabled = options.find(item => item.optionValue === child?.props?.value)
            if (childDisabled?.disabled === true) {
              return React.cloneElement(child, { disabled: true })
            }
            return React.cloneElement(child)
          })}
        </Radio.Group>
      </Form.Item>
    }
    if (type === 'MultiCategory') {
      const radioDisabled = options.filter(item => (item.optionValue === 'nolimit' || item.optionValue === 'partial') && item?.disabled).map(item => item.optionValue)
      const optionsWithDisabled = options.filter(item => item.optionValue !== 'nolimit' && item.optionValue !== 'partial' && item?.disabled).map(item => item.optionValue)
      const otherAddProps = { radioDisabled, optionsDisabled: optionsWithDisabled }
      return (
        <Form.Item name={name} label={label} style={style} {...others} {...formAddProps} className={hidden ? 'formitem-template-hidden' : ''}>
          {React.cloneElement(children, { ...addProps, ...otherAddProps })}
        </Form.Item>
      )
    }
    if (type === 'Checkbox') {
      return <Form.Item name={name} label={label} style={style} {...others} {...formAddProps} className={hidden ? 'formitem-template-hidden' : ''}>
        <Checkbox.Group {...children.props} {...addProps}>
          {React.Children.map(children.props.children, child => {
            const childDisabled = options.find(item => item.optionValue === child?.props?.value)
            if (childDisabled?.disabled) {
              return React.cloneElement(child, { disabled: true })
            }
            return React.cloneElement(child)
          })}
        </Checkbox.Group>
      </Form.Item>
    }
    if (type === 'RadioCheckBoxComb') {
      const optDisabledStr = options.filter(item => item?.disabled).map(item => item.optionValue).join()
      const otherAddProps = { optDisabledStr }
      return (
        <Form.Item name={name} label={label} style={style} className={hidden ? 'formitem-template-hidden' : ''} {...others} {...formAddProps}>
          {
            React.cloneElement(children, { ...addProps, ...otherAddProps })
          }
        </Form.Item>
      )
    }
  }
  /* antd4未匹配到模版 */
  return <Form.Item label={label} name={name}  {...others} style={style}>{children}</Form.Item>
}

export default FormItemTemp
