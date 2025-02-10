import React, { useRef } from 'react';
import { Form, Radio, Divider, Button } from 'antd';
import { FormTemp, FormItemTemp, LinkConfigItem } from 'antd-form-linkage';
import 'antd-form-linkage/dist/styles.css';

const FormItem = Form.Item;

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

console.log('Imported FormTemp:', FormTemp);
console.log('Imported FormItemTemp:', FormItemTemp);

function App() {
  const [form] = Form.useForm();

  const finalLinkConfigRef = useRef([])

  const onActiveItemChange = (val: LinkConfigItem[]) => {
    finalLinkConfigRef.current = val;
  };

  return (
    <div style={{ padding: '20px' }}>
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

          <Button onClick={() => {
            console.log('111', form.getFieldsValue())
          }
          }>数据</Button>
        </FormTemp>
      <Button onClick={() => console.log(form.getFieldsValue())}>
        Get Values
      </Button>
    </div>
  );
}

export default App; 