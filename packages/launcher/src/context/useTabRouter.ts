import type { Dispatch, ReactElement, ReactNode, SetStateAction } from 'react';
import { createContext, useContext } from 'react';

export interface ViewNode {
    name: string;
    index: number;
    icon?: ReactElement;
    /** 如果是ViewNode, 说明是一个下级标签, 否则说明是一个View, 如果为空, 说明是返回按钮 */
    view?: ReactNode | ViewNode[];
    /** 是否是默认显示的View, 此时view只能是ReactNode类型 */
    default?: boolean;
}

export interface TabRouterContextValue {
    routerStack: ViewNode[];
    currentTab: number;
    push: (viewNode: ViewNode) => void;
    back: () => void;
    setTab: Dispatch<SetStateAction<number>>;
}

export const TabRouterContext = createContext({} as TabRouterContextValue);

export function useTabRouter() {
    return useContext(TabRouterContext);
}
