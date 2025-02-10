import React, { useMemo, useRef } from 'react';
import './App.css';
import 'antd/dist/antd.css'
import { Form, Radio, Divider, Button } from 'antd'
import FormItemTemp from './components/FormItemTemp'
import FormTemp, { LinkConfigItem } from './components/FormTemp'
import { linkConfig } from './config'


function App() {
  const [form] = Form.useForm()

  const finalLinkConfigRef = useRef<LinkConfigItem[]>([])

  const onActiveItemChange = (val: LinkConfigItem[]) => {
    finalLinkConfigRef.current = val;
  };

  return (
    <div className="App">
      <header className="App-header">
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
      </header>
    </div>
  );
}

export default App;
