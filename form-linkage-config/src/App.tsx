import React, { useMemo, useRef } from 'react';
import './App.css';
import 'antd/dist/antd.css'
import { Form, Radio, Divider, Button } from 'antd'
import LinkageFormItem from './components/LinkageFormItem'
import LinkageForm, { LinkConfigItem } from './components/LinkageForm'
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
        <LinkageForm form={form} linkConfig={linkConfig} onActiveItemChange={onActiveItemChange}>
          {/* 主联动字段1 */}
          <LinkageFormItem label='activeItem1' name='activeItem1' type='Radio' initialValue={1} template={undefined}>
            <Radio.Group>
              <Radio value={1}>{'value1'}</Radio>
              <Radio value={2}>{'value2'}</Radio>
            </Radio.Group>
          </LinkageFormItem>
          <LinkageFormItem label='activeItem2' name='activeItem2' type='Radio' initialValue={1} template={undefined}>
            <Radio.Group>
              <Radio value={1}>{'value1'}</Radio>
              <Radio value={2}>{'value2'}</Radio>
            </Radio.Group>
          </LinkageFormItem>
          <Divider plain />
          <Form.Item dependencies={['activeItem1', 'activeItem2']}>
            {() => (
              <div>
                <LinkageFormItem label='targetItem1' name='targetItem1' type='Radio' template={finalLinkConfigRef.current}>
                  <Radio.Group>
                    <Radio value={1}>{'value1'}</Radio>
                    <Radio value={2}>{'value2'}</Radio>
                  </Radio.Group>
                </LinkageFormItem>
                <LinkageFormItem label='targetItem2' name='targetItem2' type='Radio' template={finalLinkConfigRef.current}>
                  <Radio.Group>
                    <Radio value={1}>{'value1'}</Radio>
                    <Radio value={2}>{'value2'}</Radio>
                  </Radio.Group>
                </LinkageFormItem>
                <LinkageFormItem label='targetItem3' name='targetItem3' type='Radio' template={finalLinkConfigRef.current}>
                  <Radio.Group>
                    <Radio value={1}>{'value1'}</Radio>
                    <Radio value={2}>{'value2'}</Radio>
                  </Radio.Group>
                </LinkageFormItem>
              </div>
            )}
          </Form.Item>

          <Button onClick={() => {
            console.log('111', form.getFieldsValue())
          }
          }>数据</Button>
        </LinkageForm>
      </header>
    </div>
  );
}

export default App;
