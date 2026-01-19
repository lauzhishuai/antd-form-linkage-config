/**
 * @description Demo 页面
 * 展示各种表单联动场景
 */
import React, { useState } from 'react';
import {
  Form,
  Select,
  Input,
  InputNumber,
  Radio,
  Checkbox,
  Button,
  Card,
  Tabs,
  Space,
  Divider,
  message,
} from 'antd';
import LinkageForm from './components/LinkageForm';
import LinkageFormItem from './components/LinkageFormItem';
import LinkageDevTools from './components/LinkageDevTools';
import { LinkageConfig } from './types';
import './App.css';

const { TabPane } = Tabs;
const { Option } = Select;

/**
 * Demo 1: 基础联动
 * 展示字段值变化触发其他字段的禁用、隐藏、值重置
 */
const BasicDemo: React.FC = () => {
  const [form] = Form.useForm();

  const linkageConfig: LinkageConfig = {
    debug: true,
    fields: [
      {
        name: 'targetField',
        dependencies: ['triggerField'],
        compute: ({ triggerField }) => {
          switch (triggerField) {
            case 'disable':
              return { disabled: true, value: undefined };
            case 'hide':
              return { hidden: true, value: undefined };
            case 'setValue':
              return { disabled: false, hidden: false, value: '自动填充的值' };
            default:
              return { disabled: false, hidden: false };
          }
        },
      },
      {
        name: 'optionsField',
        dependencies: ['triggerField'],
        compute: ({ triggerField }) => {
          if (triggerField === 'disableOption') {
            return {
              options: [
                { value: 'option1', disabled: true },
                { value: 'option2', disabled: false },
                { value: 'option3', disabled: true },
              ],
            };
          }
          return {
            options: [
              { value: 'option1', disabled: false },
              { value: 'option2', disabled: false },
              { value: 'option3', disabled: false },
            ],
          };
        },
      },
    ],
  };

  return (
    <Card title="🎯 基础联动示例" className="demo-card">
      <p className="demo-description">
        选择不同的触发选项，观察目标字段的变化（禁用、隐藏、自动填值、选项禁用）
      </p>
      <LinkageForm form={form} linkage={linkageConfig} layout="vertical">
        <LinkageFormItem
          name="triggerField"
          label="触发字段"
          initialValue="normal"
        >
          <Radio.Group>
            <Radio.Button value="normal">正常</Radio.Button>
            <Radio.Button value="disable">禁用目标</Radio.Button>
            <Radio.Button value="hide">隐藏目标</Radio.Button>
            <Radio.Button value="setValue">自动填值</Radio.Button>
            <Radio.Button value="disableOption">禁用选项</Radio.Button>
          </Radio.Group>
        </LinkageFormItem>

        <LinkageFormItem name="targetField" label="目标字段">
          <Input placeholder="这个字段会根据触发字段变化" />
        </LinkageFormItem>

        <LinkageFormItem name="optionsField" label="选项联动" type="Select">
          <Select
            placeholder="选择一个选项"
            options={[
              { value: 'option1', label: '选项 1' },
              { value: 'option2', label: '选项 2' },
              { value: 'option3', label: '选项 3' },
            ]}
          />
        </LinkageFormItem>

        <LinkageDevTools defaultOpen position="bottom-right" />
      </LinkageForm>
    </Card>
  );
};

/**
 * Demo 2: 级联选择
 * 展示省市区三级联动
 */
const CascadeDemo: React.FC = () => {
  const [form] = Form.useForm();

  // 模拟数据
  const provinceData = [
    { value: 'zhejiang', label: '浙江省' },
    { value: 'jiangsu', label: '江苏省' },
    { value: 'guangdong', label: '广东省' },
  ];

  const cityData: Record<string, { value: string; label: string }[]> = {
    zhejiang: [
      { value: 'hangzhou', label: '杭州市' },
      { value: 'ningbo', label: '宁波市' },
      { value: 'wenzhou', label: '温州市' },
    ],
    jiangsu: [
      { value: 'nanjing', label: '南京市' },
      { value: 'suzhou', label: '苏州市' },
      { value: 'wuxi', label: '无锡市' },
    ],
    guangdong: [
      { value: 'guangzhou', label: '广州市' },
      { value: 'shenzhen', label: '深圳市' },
      { value: 'dongguan', label: '东莞市' },
    ],
  };

  const districtData: Record<string, { value: string; label: string }[]> = {
    hangzhou: [
      { value: 'xihu', label: '西湖区' },
      { value: 'binjiang', label: '滨江区' },
      { value: 'xiaoshan', label: '萧山区' },
    ],
    nanjing: [
      { value: 'xuanwu', label: '玄武区' },
      { value: 'jianye', label: '建邺区' },
      { value: 'qinhuai', label: '秦淮区' },
    ],
    shenzhen: [
      { value: 'nanshan', label: '南山区' },
      { value: 'futian', label: '福田区' },
      { value: 'luohu', label: '罗湖区' },
    ],
  };

  const linkageConfig: LinkageConfig = {
    debug: true,
    fields: [
      {
        name: 'city',
        dependencies: ['province'],
        compute: ({ province }) => ({
          value: undefined,
          options: cityData[province] || [],
        }),
      },
      {
        name: 'district',
        dependencies: ['city'],
        compute: ({ city }) => ({
          value: undefined,
          options: districtData[city] || [],
        }),
      },
    ],
  };

  return (
    <Card title="🏙️ 级联选择示例" className="demo-card">
      <p className="demo-description">
        省市区三级联动：选择省份后，城市选项自动更新；选择城市后，区县选项自动更新
      </p>
      <LinkageForm form={form} linkage={linkageConfig} layout="vertical">
        <Space size="middle" wrap>
          <LinkageFormItem name="province" label="省份" style={{ width: 180 }}>
            <Select placeholder="请选择省份" options={provinceData} />
          </LinkageFormItem>

          <LinkageFormItem
            name="city"
            label="城市"
            type="Select"
            style={{ width: 180 }}
          >
            <Select placeholder="请先选择省份" options={[]} />
          </LinkageFormItem>

          <LinkageFormItem
            name="district"
            label="区县"
            type="Select"
            style={{ width: 180 }}
          >
            <Select placeholder="请先选择城市" options={[]} />
          </LinkageFormItem>
        </Space>

        <LinkageDevTools position="bottom-right" />
      </LinkageForm>
    </Card>
  );
};

/**
 * Demo 3: 计算字段
 * 展示价格计算、条件显隐
 */
const ComputedDemo: React.FC = () => {
  const [form] = Form.useForm();

  const linkageConfig: LinkageConfig = {
    debug: true,
    fields: [
      // 计算小计
      {
        name: 'subtotal',
        dependencies: ['price', 'quantity'],
        compute: ({ price, quantity }) => ({
          value: (Number(price) || 0) * (Number(quantity) || 0),
        }),
      },
      // 计算折扣金额
      {
        name: 'discountAmount',
        dependencies: ['subtotal', 'discountRate'],
        compute: ({ subtotal, discountRate }) => ({
          value: ((Number(subtotal) || 0) * (Number(discountRate) || 0)) / 100,
        }),
      },
      // 计算总价
      {
        name: 'total',
        dependencies: ['subtotal', 'discountAmount'],
        compute: ({ subtotal, discountAmount }) => ({
          value: (Number(subtotal) || 0) - (Number(discountAmount) || 0),
        }),
      },
      // 金额超过1000显示VIP提示
      {
        name: 'vipHint',
        dependencies: ['total'],
        compute: ({ total }) => ({
          hidden: (Number(total) || 0) < 1000,
        }),
      },
    ],
  };

  return (
    <Card title="🧮 计算字段示例" className="demo-card">
      <p className="demo-description">
        自动计算：小计 = 单价 × 数量，总价 = 小计 - 折扣。金额超过1000元显示VIP提示
      </p>
      <LinkageForm
        form={form}
        linkage={linkageConfig}
        layout="vertical"
        initialValues={{ quantity: 1, discountRate: 0 }}
      >
        <Space size="middle" wrap align="start">
          <LinkageFormItem name="price" label="单价 (元)">
            <InputNumber min={0} placeholder="请输入单价" style={{ width: 140 }} />
          </LinkageFormItem>

          <LinkageFormItem name="quantity" label="数量">
            <InputNumber min={1} placeholder="数量" style={{ width: 100 }} />
          </LinkageFormItem>

          <LinkageFormItem name="subtotal" label="小计 (元)">
            <InputNumber disabled style={{ width: 140 }} />
          </LinkageFormItem>
        </Space>

        <Divider style={{ margin: '16px 0' }} />

        <Space size="middle" wrap align="start">
          <LinkageFormItem name="discountRate" label="折扣率 (%)">
            <InputNumber min={0} max={100} style={{ width: 100 }} />
          </LinkageFormItem>

          <LinkageFormItem name="discountAmount" label="折扣金额">
            <InputNumber disabled style={{ width: 140 }} />
          </LinkageFormItem>

          <LinkageFormItem name="total" label="总价 (元)">
            <InputNumber
              disabled
              style={{ width: 140, fontWeight: 'bold' }}
            />
          </LinkageFormItem>
        </Space>

        <LinkageFormItem name="vipHint" label="">
          <div className="vip-hint">
            🎉 恭喜！订单金额超过1000元，您将获得VIP专属优惠！
          </div>
        </LinkageFormItem>

        <LinkageDevTools position="bottom-right" />
      </LinkageForm>
    </Card>
  );
};

/**
 * Demo 4: 多依赖联动
 * 展示一个字段依赖多个字段的场景
 */
const MultiDependencyDemo: React.FC = () => {
  const [form] = Form.useForm();

  const linkageConfig: LinkageConfig = {
    debug: true,
    fields: [
      {
        name: 'recommendation',
        dependencies: ['age', 'gender', 'hobby'],
        compute: ({ age, gender, hobby }) => {
          const ageNum = Number(age) || 0;
          let recommendation = '';

          if (!age || !gender) {
            return { value: '请填写年龄和性别' };
          }

          if (ageNum < 18) {
            recommendation = gender === 'male' ? '推荐：青少年男装' : '推荐：青少年女装';
          } else if (ageNum < 30) {
            recommendation = gender === 'male' ? '推荐：时尚男装' : '推荐：时尚女装';
          } else {
            recommendation = gender === 'male' ? '推荐：商务男装' : '推荐：优雅女装';
          }

          if (hobby === 'sports') {
            recommendation += ' + 运动系列';
          } else if (hobby === 'outdoor') {
            recommendation += ' + 户外系列';
          }

          return { value: recommendation };
        },
      },
    ],
  };

  return (
    <Card title="🔗 多依赖联动示例" className="demo-card">
      <p className="demo-description">
        推荐内容根据年龄、性别、爱好三个字段综合计算
      </p>
      <LinkageForm form={form} linkage={linkageConfig} layout="vertical">
        <Space size="middle" wrap>
          <LinkageFormItem name="age" label="年龄">
            <InputNumber min={1} max={120} placeholder="年龄" style={{ width: 100 }} />
          </LinkageFormItem>

          <LinkageFormItem name="gender" label="性别">
            <Radio.Group>
              <Radio value="male">男</Radio>
              <Radio value="female">女</Radio>
            </Radio.Group>
          </LinkageFormItem>

          <LinkageFormItem name="hobby" label="爱好">
            <Select placeholder="选择爱好" style={{ width: 140 }}>
              <Option value="reading">阅读</Option>
              <Option value="sports">运动</Option>
              <Option value="outdoor">户外</Option>
              <Option value="music">音乐</Option>
            </Select>
          </LinkageFormItem>
        </Space>

        <Divider />

        <LinkageFormItem name="recommendation" label="个性化推荐">
          <Input.TextArea
            disabled
            rows={2}
            style={{ background: '#f6ffed', color: '#52c41a' }}
          />
        </LinkageFormItem>

        <LinkageDevTools position="bottom-right" />
      </LinkageForm>
    </Card>
  );
};

/**
 * Demo 5: 表单验证联动
 */
const ValidationDemo: React.FC = () => {
  const [form] = Form.useForm();

  const linkageConfig: LinkageConfig = {
    debug: true,
    fields: [
      {
        name: 'confirmPassword',
        dependencies: ['password'],
        compute: ({ password }) => {
          // 密码变化时清空确认密码
          return { value: undefined };
        },
      },
      {
        name: 'email',
        dependencies: ['contactMethod'],
        compute: ({ contactMethod }) => ({
          hidden: contactMethod !== 'email',
          required: contactMethod === 'email',
        }),
      },
      {
        name: 'phone',
        dependencies: ['contactMethod'],
        compute: ({ contactMethod }) => ({
          hidden: contactMethod !== 'phone',
          required: contactMethod === 'phone',
        }),
      },
    ],
  };

  const handleSubmit = (values: any) => {
    console.log('提交数据:', values);
    message.success('提交成功！查看控制台获取数据');
  };

  return (
    <Card title="✅ 表单验证联动示例" className="demo-card">
      <p className="demo-description">
        根据联系方式选择显示对应输入框，密码变化时清空确认密码
      </p>
      <LinkageForm
        form={form}
        linkage={linkageConfig}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{ contactMethod: 'email' }}
      >
        <LinkageFormItem
          name="password"
          label="密码"
          rules={[{ required: true, message: '请输入密码' }]}
        >
          <Input.Password placeholder="请输入密码" />
        </LinkageFormItem>

        <LinkageFormItem
          name="confirmPassword"
          label="确认密码"
          rules={[
            { required: true, message: '请确认密码' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('两次输入的密码不一致'));
              },
            }),
          ]}
        >
          <Input.Password placeholder="请再次输入密码" />
        </LinkageFormItem>

        <Divider />

        <LinkageFormItem name="contactMethod" label="联系方式">
          <Radio.Group>
            <Radio value="email">邮箱</Radio>
            <Radio value="phone">手机</Radio>
          </Radio.Group>
        </LinkageFormItem>

        <LinkageFormItem
          name="email"
          label="邮箱地址"
          rules={[
            { type: 'email', message: '请输入有效的邮箱地址' },
          ]}
        >
          <Input placeholder="请输入邮箱" />
        </LinkageFormItem>

        <LinkageFormItem
          name="phone"
          label="手机号码"
          rules={[
            { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号' },
          ]}
        >
          <Input placeholder="请输入手机号" />
        </LinkageFormItem>

        <Form.Item>
          <Button type="primary" htmlType="submit">
            提交
          </Button>
        </Form.Item>

        <LinkageDevTools position="bottom-right" />
      </LinkageForm>
    </Card>
  );
};

/**
 * 主 App 组件
 */
const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('basic');

  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="app-title">
          <span className="app-logo">🔗</span>
          Antd Form Linkage
        </h1>
        <p className="app-subtitle">
          基于依赖图的响应式表单联动解决方案
        </p>
      </header>

      <main className="app-main">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          type="card"
          className="demo-tabs"
        >
          <TabPane tab="🎯 基础联动" key="basic">
            <BasicDemo />
          </TabPane>
          <TabPane tab="🏙️ 级联选择" key="cascade">
            <CascadeDemo />
          </TabPane>
          <TabPane tab="🧮 计算字段" key="computed">
            <ComputedDemo />
          </TabPane>
          <TabPane tab="🔗 多依赖" key="multi">
            <MultiDependencyDemo />
          </TabPane>
          <TabPane tab="✅ 验证联动" key="validation">
            <ValidationDemo />
          </TabPane>
        </Tabs>
      </main>

      <footer className="app-footer">
        <p>
          Made with ❤️ | 
          <a
            href="https://github.com/your-repo/antd-form-linkage"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
        </p>
      </footer>
    </div>
  );
};

export default App;
