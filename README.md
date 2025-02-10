### 联动配置化表单组件



#### 使用

1.install

```bash
npm install antd-form-linkage
```

2.使用场景引入对应css  

```js
import "antd-form-linkage/dist/styles.css"
```

3.使用示例：

```js
// 联动配置
const linkConfig = {
  activeItem1: {
    1: [
      {
        formName: 'targetItem1',
        changeValue: 2,
        disabled: true
      }
    ],
    2: [
      {
        formName: 'targetItem1',
        changeValue: 1,
        hidden: true
      }
    ]
  }
};

// 调用
import { FormTemp, FormItemTemp, LinkConfigItem } from 'antd-form-linkage';

function Example () = {
  const [form] = Form.useForm();
  const finalLinkConfigRef = useRef([])
  // 获取
  const onActiveItemChange = (val: LinkConfigItem[]) => {
    finalLinkConfigRef.current = val;
  };

  retrun (
    <div>
     <h2>FormTemp Component</h2>
     <FormTemp form={form} linkConfig={linkConfig} onActiveItemChange={onActiveItemChange}>
       {/* 主联动字段1 */}
       <FormItemTemp label='activeItem1' name='activeItem1' type='Radio' initialValue={1} template={undefined}>
          <Radio.Group>
            <Radio value={1}>{'value1'}</Radio>
            <Radio value={2}>{'value2'}</Radio>
          </Radio.Group>
        </FormItemTemp>
        <FormItemTemp label='activeItem2' name='activeItem2' type='Radio' initialValue={1} template={undefined}>
          <Radio.Group>
            <Radio value={1}>{'value1'}</Radio>
            <Radio value={2}>{'value2'}</Radio>
          </Radio.Group>
        </FormItemTemp>
        <Divider plain />
        <Form.Item dependencies={['activeItem1', 'activeItem2']}>
          {() => (
            <div>
              <FormItemTemp label='targetItem1' name='targetItem1' type='Radio' template={finalLinkConfigRef.current}>
                <Radio.Group>
                  <Radio value={1}>{'value1'}</Radio>
                  <Radio value={2}>{'value2'}</Radio>
                </Radio.Group>
              </FormItemTemp>
              <FormItemTemp label='targetItem2' name='targetItem2' type='Radio' template={finalLinkConfigRef.current}>
                <Radio.Group>
                  <Radio value={1}>{'value1'}</Radio>
                  <Radio value={2}>{'value2'}</Radio>
                </Radio.Group>
              </FormItemTemp>
              <FormItemTemp label='targetItem3' name='targetItem3' type='Radio' template={finalLinkConfigRef.current}>
                <Radio.Group>
                  <Radio value={1}>{'value1'}</Radio>
                  <Radio value={2}>{'value2'}</Radio>
                </Radio.Group>
              </FormItemTemp>
            </div>
          )}
        </Form.Item>
  </FormTemp>
  </div>
  )
}
```
