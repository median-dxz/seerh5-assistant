import React, { forwardRef, useCallback } from 'react';

import { theme } from '@/style';
import { Fade, Stack, Tabs } from '@mui/material';
import { alpha, Box } from '@mui/system';
import { StyledTab } from './styled/Tab';

import { useTabRouter, type ViewNode } from '@/context/useTabRouter';
import { SwitchTransition } from 'react-transition-group';

interface Tab {
    index: number;
    name: string;
}

interface TabsGroupProps {
    tabs: Tab[];
    value: number;
    onSelect: (tab: number) => void;
}

function a11yProps(index: number) {
    return {
        id: `vertical-tab-${index}`,
        role: 'tab',
        'aria-controls': `vertical-tabpanel-${index}`,
    };
}

const TabsGroup = forwardRef<HTMLDivElement, TabsGroupProps>(function ({ onSelect, tabs, value }: TabsGroupProps, ref) {
    const { routerStack } = useTabRouter();
    return (
        <SwitchTransition>
            <Fade
                key={routerStack.length}
                timeout={150}
                appear={false}
                mountOnEnter
                unmountOnExit
                easing={{
                    enter: theme.transitions.easing.easeOut,
                    exit: theme.transitions.easing.easeInOut,
                }}
            >
                <Tabs
                    id="tabs-group"
                    role="tablist"
                    orientation="vertical"
                    value={value}
                    ref={ref}
                    sx={{
                        position: 'absolute',
                        left: 0,
                        width: '100%',
                    }}
                >
                    {tabs.map(({ index, name }) => (
                        <StyledTab
                            key={index}
                            onClick={() => onSelect(index)}
                            label={name}
                            disableRipple
                            {...a11yProps(index)}
                        />
                    ))}
                </Tabs>
            </Fade>
        </SwitchTransition>
    );
});

export function TabView() {
    const { routerStack, currentTab, back, push, setTab } = useTabRouter();
    let currentViewNodes = routerStack.at(-1)?.view as ViewNode[];

    if (routerStack.length > 1) {
        currentViewNodes = [
            {
                index: 0,
                name: '返回',
            },
            ...currentViewNodes,
        ];
    }

    const currentView = currentViewNodes[currentTab].view as React.ReactNode;

    const handleSelectTab = useCallback(
        (idx: number) => {
            if (idx === 0 && routerStack.length > 1) {
                back();
                return;
            }
            const currentViewNode = currentViewNodes[idx];
            if (Array.isArray(currentViewNode.view)) {
                push(currentViewNode);
            } else {
                setTab(idx);
            }
        },
        [back, currentViewNodes, push, routerStack.length, setTab]
    );

    return (
        <Box
            display="flex"
            sx={{
                left: 'calc(25vw / 2)',
                width: '75vw',
                height: '100%',
            }}
        >
            <Stack
                sx={{
                    position: 'relative',
                    height: '100%',
                    width: '168px',
                    minWidth: '168px',
                    justifyContent: 'center',
                    borderRight: (theme) => `1px solid ${alpha(theme.palette.divider, 0.12)}`,
                }}
            >
                <TabsGroup tabs={currentViewNodes} onSelect={handleSelectTab} value={currentTab} />
            </Stack>
            <Box
                role="tabpanel"
                sx={{
                    width: '100%',
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    marginRight: '-1px',
                }}
                id={`vertical-tabpanel-${currentTab}`}
                aria-labelledby={`vertical-tab-${currentTab}`}
            >
                <SwitchTransition>
                    <Fade
                        key={routerStack.length}
                        timeout={150}
                        appear={false}
                        mountOnEnter
                        unmountOnExit
                        easing={{
                            enter: theme.transitions.easing.easeOut,
                            exit: theme.transitions.easing.easeInOut,
                        }}
                    >
                        <Box id="tab-view-transition-ref"> {currentView} </Box>
                    </Fade>
                </SwitchTransition>
            </Box>
        </Box>
    );
}
