/**
 * @description 联动上下文
 * 提供全局联动状态管理
 */

import React, { createContext, useContext, useMemo, useSyncExternalStore } from 'react';
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
 * 使用 useSyncExternalStore 实现精确的状态订阅
 */
export function useFieldState(name: string): FieldState | undefined {
  const { engine } = useLinkageContext();

  const subscribe = useMemo(() => {
    if (!engine) {
      return (callback: () => void) => () => {};
    }
    return (callback: () => void) => {
      return engine.subscribe(callback);
    };
  }, [engine]);

  const getSnapshot = useMemo(() => {
    return () => engine?.getFieldState(name);
  }, [engine, name]);

  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

/**
 * 订阅所有字段状态
 */
export function useAllFieldStates(): Map<string, FieldState> {
  const { engine } = useLinkageContext();

  const subscribe = useMemo(() => {
    if (!engine) {
      return (callback: () => void) => () => {};
    }
    return (callback: () => void) => {
      return engine.subscribe(callback);
    };
  }, [engine]);

  const getSnapshot = useMemo(() => {
    return () => engine?.getAllFieldStates() || new Map();
  }, [engine]);

  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export { LinkageContext };

