import type { PropsWithChildren } from 'react';
import { useCallback, useState } from 'react';

import { TabRouterContext, type ViewNode } from '@/context/useTabRouter';

const defaultTab = (nodes: ViewNode[]) => nodes.find((node) => node.default)?.index;

interface TabRouterProviderProps {
    rootView: ViewNode;
}

export function TabRouterProvider({ children, rootView }: PropsWithChildren<TabRouterProviderProps>) {
    const [viewNodeStack, setViewNodeStack] = useState<ViewNode[]>([rootView]);
    const [currentViewIndex, setCurrentViewIndex] = useState<number>(() => defaultTab(rootView.view as ViewNode[])!);

    const updateRouter = useCallback((newViewNodeStack: ViewNode[]) => {
        setViewNodeStack(newViewNodeStack);
        setCurrentViewIndex(defaultTab(newViewNodeStack.at(-1)?.view as ViewNode[])!);
    }, []);

    const back = useCallback(() => {
        if (viewNodeStack.length > 1) {
            const newViewNodeStack = viewNodeStack.slice(0, -1);
            updateRouter(newViewNodeStack);
        }
    }, [updateRouter, viewNodeStack]);

    const push = useCallback(
        (viewNode: ViewNode) => {
            const newViewNodeStack = viewNodeStack.concat(viewNode);
            updateRouter(newViewNodeStack);
        },
        [updateRouter, viewNodeStack]
    );

    return (
        <TabRouterContext
            value={{
                back,
                push,
                routerStack: viewNodeStack,
                currentTab: currentViewIndex,
                setTab: setCurrentViewIndex
            }}
        >
            {children}
        </TabRouterContext>
    );
}
