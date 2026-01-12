/**
 * @description 联动上下文
 * 提供全局联动状态管理
 */

import React, { createContext, useContext, useMemo, useState, useEffect, useCallback } from 'react';
import { LinkageContextValue, FieldState, LinkageEngine } from '../types';

/**
 * 联动上下文
 */
const LinkageContext = createContext<LinkageContextValue | null>(null);

/**
 * Provider Props
 */
interface LinkageProviderProps {
  engine: LinkageEngine | null;
  debug?: boolean;
  children: React.ReactNode;
}

/**
 * 联动 Provider
 */
export const LinkageProvider: React.FC<LinkageProviderProps> = ({
  engine,
  debug = false,
  children,
}) => {
  const value = useMemo<LinkageContextValue>(
    () => ({
      engine,
      getFieldState: (name: string) => engine?.getFieldState(name),
      debug,
    }),
    [engine, debug]
  );

  return (
    <LinkageContext.Provider value={value}>{children}</LinkageContext.Provider>
  );
};

/**
 * 获取联动上下文
 */
export function useLinkageContext(): LinkageContextValue {
  const context = useContext(LinkageContext);
  if (!context) {
    // 如果没有 Provider，返回空实现（向后兼容）
    return {
      engine: null,
      getFieldState: () => undefined,
      debug: false,
    };
  }
  return context;
}

/**
 * 订阅单个字段状态
 * 兼容 React 17 的实现
 */
export function useFieldState(name: string): FieldState | undefined {
  const { engine } = useLinkageContext();
  const [state, setState] = useState<FieldState | undefined>(() => 
    engine?.getFieldState(name)
  );

  useEffect(() => {
    if (!engine) return;

    // 初始化状态
    setState(engine.getFieldState(name));

    // 订阅状态变化
    const unsubscribe = engine.subscribe((allStates) => {
      setState(allStates.get(name));
    });

    return unsubscribe;
  }, [engine, name]);

  return state;
}

/**
 * 订阅所有字段状态
 * 兼容 React 17 的实现
 */
export function useAllFieldStates(): Map<string, FieldState> {
  const { engine } = useLinkageContext();
  const [states, setStates] = useState<Map<string, FieldState>>(() => 
    engine?.getAllFieldStates() || new Map()
  );

  useEffect(() => {
    if (!engine) return;

    // 初始化状态
    setStates(engine.getAllFieldStates());

    // 订阅状态变化
    const unsubscribe = engine.subscribe((allStates) => {
      setStates(new Map(allStates));
    });

    return unsubscribe;
  }, [engine]);

  return states;
}

export { LinkageContext };

