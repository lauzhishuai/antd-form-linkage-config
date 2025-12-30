/**
 * @description 联动调试面板
 * 可视化展示表单联动状态、依赖图和触发链路
 */
import React, { useState, useMemo } from 'react';
import { useAllFieldStates, useLinkageContext } from '../../context/LinkageContext';
import { FieldState } from '../../types';
import './styles.css';

interface LinkageDevToolsProps {
  /**
   * 是否默认展开
   */
  defaultOpen?: boolean;
  
  /**
   * 位置
   */
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  
  /**
   * 是否在生产环境隐藏
   */
  hideInProduction?: boolean;
}

/**
 * 状态标签组件
 */
const StatusBadge: React.FC<{ status: boolean | undefined; label: string }> = ({
  status,
  label,
}) => {
  if (status === undefined) return null;
  return (
    <span className={`linkage-devtools-badge ${status ? 'active' : 'inactive'}`}>
      {label}
    </span>
  );
};

/**
 * 字段状态卡片
 */
const FieldCard: React.FC<{ name: string; state: FieldState }> = ({ name, state }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="linkage-devtools-field-card">
      <div
        className="linkage-devtools-field-header"
        onClick={() => setExpanded(!expanded)}
      >
        <span className="linkage-devtools-field-name">{name}</span>
        <div className="linkage-devtools-badges">
          <StatusBadge status={state.loading} label="加载中" />
          <StatusBadge status={state.disabled} label="禁用" />
          <StatusBadge status={state.hidden} label="隐藏" />
          <StatusBadge status={state.required} label="必填" />
          {state.error && (
            <span className="linkage-devtools-badge error">错误</span>
          )}
        </div>
        <span className="linkage-devtools-expand-icon">
          {expanded ? '▼' : '▶'}
        </span>
      </div>

      {expanded && (
        <div className="linkage-devtools-field-detail">
          <div className="linkage-devtools-detail-row">
            <span className="linkage-devtools-detail-label">value:</span>
            <code className="linkage-devtools-detail-value">
              {JSON.stringify(state.value, null, 2) ?? 'undefined'}
            </code>
          </div>
          {state.options && state.options.length > 0 && (
            <div className="linkage-devtools-detail-row">
              <span className="linkage-devtools-detail-label">options:</span>
              <code className="linkage-devtools-detail-value">
                {JSON.stringify(state.options, null, 2)}
              </code>
            </div>
          )}
          {state.error && (
            <div className="linkage-devtools-detail-row error">
              <span className="linkage-devtools-detail-label">error:</span>
              <code className="linkage-devtools-detail-value">
                {state.error.message}
              </code>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * 联动调试面板
 * 
 * @description
 * 提供实时的联动状态可视化，帮助开发者调试表单联动逻辑。
 * 
 * ## 功能
 * - 📊 实时显示所有字段的联动状态
 * - 🔍 展开查看详细信息（value、options 等）
 * - 🎯 状态标签快速识别（禁用、隐藏、加载中等）
 * - 🐛 错误信息展示
 * 
 * ## 使用示例
 * 
 * ```tsx
 * <LinkageForm linkage={config}>
 *   <LinkageFormItem name="field1">...</LinkageFormItem>
 *   <LinkageDevTools defaultOpen />
 * </LinkageForm>
 * ```
 */
const LinkageDevTools: React.FC<LinkageDevToolsProps> = ({
  defaultOpen = false,
  position = 'bottom-right',
  hideInProduction = true,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [activeTab, setActiveTab] = useState<'states' | 'graph'>('states');
  const fieldStates = useAllFieldStates();
  const { debug } = useLinkageContext();

  // 生产环境隐藏
  if (hideInProduction && process.env.NODE_ENV === 'production') {
    return null;
  }

  const positionClass = `linkage-devtools-${position}`;
  const fieldEntries = useMemo(() => Array.from(fieldStates.entries()), [fieldStates]);

  return (
    <div className={`linkage-devtools-container ${positionClass}`}>
      {/* 切换按钮 */}
      <button
        className="linkage-devtools-toggle"
        onClick={() => setIsOpen(!isOpen)}
        title="联动调试面板"
      >
        <span className="linkage-devtools-toggle-icon">🔗</span>
        {fieldStates.size > 0 && (
          <span className="linkage-devtools-count">{fieldStates.size}</span>
        )}
      </button>

      {/* 面板内容 */}
      {isOpen && (
        <div className="linkage-devtools-panel">
          <div className="linkage-devtools-header">
            <h3 className="linkage-devtools-title">
              Linkage DevTools
              {debug && <span className="linkage-devtools-debug-badge">DEBUG</span>}
            </h3>
            <button
              className="linkage-devtools-close"
              onClick={() => setIsOpen(false)}
            >
              ✕
            </button>
          </div>

          {/* 标签页 */}
          <div className="linkage-devtools-tabs">
            <button
              className={`linkage-devtools-tab ${activeTab === 'states' ? 'active' : ''}`}
              onClick={() => setActiveTab('states')}
            >
              字段状态
            </button>
            <button
              className={`linkage-devtools-tab ${activeTab === 'graph' ? 'active' : ''}`}
              onClick={() => setActiveTab('graph')}
            >
              依赖图
            </button>
          </div>

          <div className="linkage-devtools-content">
            {activeTab === 'states' && (
              <div className="linkage-devtools-states">
                {fieldEntries.length === 0 ? (
                  <div className="linkage-devtools-empty">
                    暂无联动字段状态
                    <p className="linkage-devtools-empty-hint">
                      请确保已配置 linkage 并触发了表单值变化
                    </p>
                  </div>
                ) : (
                  fieldEntries.map(([name, state]) => (
                    <FieldCard key={name} name={name} state={state} />
                  ))
                )}
              </div>
            )}

            {activeTab === 'graph' && (
              <div className="linkage-devtools-graph">
                <DependencyGraph />
              </div>
            )}
          </div>

          <div className="linkage-devtools-footer">
            <span className="linkage-devtools-hint">
              💡 提示：开启 debug 模式可在控制台查看详细日志
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * 依赖图可视化组件
 */
const DependencyGraph: React.FC = () => {
  const { engine } = useLinkageContext();
  const fieldStates = useAllFieldStates();

  if (!engine) {
    return (
      <div className="linkage-devtools-empty">
        联动引擎未初始化
      </div>
    );
  }

  const fieldNames = Array.from(fieldStates.keys());

  if (fieldNames.length === 0) {
    return (
      <div className="linkage-devtools-empty">
        暂无依赖关系
        <p className="linkage-devtools-empty-hint">
          触发表单值变化后将显示依赖图
        </p>
      </div>
    );
  }

  return (
    <div className="linkage-devtools-graph-content">
      <div className="linkage-devtools-graph-legend">
        <span className="linkage-devtools-legend-item">
          <span className="linkage-devtools-node-sample normal" />
          正常
        </span>
        <span className="linkage-devtools-legend-item">
          <span className="linkage-devtools-node-sample disabled" />
          禁用
        </span>
        <span className="linkage-devtools-legend-item">
          <span className="linkage-devtools-node-sample hidden" />
          隐藏
        </span>
      </div>
      
      <div className="linkage-devtools-nodes">
        {fieldNames.map((name) => {
          const state = fieldStates.get(name);
          let nodeClass = 'linkage-devtools-node';
          if (state?.disabled) nodeClass += ' disabled';
          if (state?.hidden) nodeClass += ' hidden';
          if (state?.loading) nodeClass += ' loading';
          
          return (
            <div key={name} className={nodeClass}>
              <span className="linkage-devtools-node-name">{name}</span>
              {state?.value !== undefined && (
                <span className="linkage-devtools-node-value">
                  {typeof state.value === 'object' 
                    ? JSON.stringify(state.value) 
                    : String(state.value)}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LinkageDevTools;

