import { Fade, Tabs, Typography } from '@mui/material';
import { alpha, Box, Stack } from '@mui/system';
import React, { forwardRef, useCallback, type ReactElement } from 'react';
import { SwitchTransition } from 'react-transition-group';
import { CoreLoader } from 'sea-core';

import { VERSION } from '@/constants';
import { useTabRouter, type ViewNode } from '@/context/useTabRouter';
import { theme } from '@/style';
import { StyledTab } from './styled/Tab';

import ArrowBack from '@mui/icons-material/ArrowBackRounded';

interface Tab {
    index: number;
    name: string;
    icon?: ReactElement;
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
                        paddingLeft: '12px',
                        '& .Mui-selected': {
                            boxShadow: (theme) => theme.boxShadow,
                            backgroundColor: ({ palette }) => alpha(palette.secondary.main, 0.12),
                            border: ({ palette }) => `1px solid ${alpha(palette.primary.main, 0.12)}`,
                        },
                        '& .MuiTabs-flexContainer': {
                            gap: '2px',
                        },
                    }}
                    TabIndicatorProps={{
                        sx: { display: 'none' },
                    }}
                >
                    {tabs.map(({ index, name, icon }) => (
                        <StyledTab
                            key={index}
                            label={name}
                            icon={icon}
                            iconPosition="start"
                            onClick={() => onSelect(index)}
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
                icon: <ArrowBack fontSize="small" />,
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
        <Stack
            direction="row"
            sx={{ width: '100vw', height: '100vh', alignItems: 'stretch', justifyContent: 'stretch' }}
        >
            <Stack
                sx={{
                    borderRight: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
                    boxShadow: theme.boxShadow,
                    minWidth: '193px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                }}
            >
                <Box sx={{ minHeight: '192px' }} />
                <Box
                    sx={{
                        position: 'relative',
                        height: '100%',
                        overflowY: 'scroll',
                        '::-webkit-scrollbar-thumb': {
                            backgroundColor: 'transparent',
                        },
                        ':hover::-webkit-scrollbar-thumb': {
                            backgroundColor: alpha(theme.palette.primary.main, 0.4),
                        },
                    }}
                >
                    <TabsGroup tabs={currentViewNodes} onSelect={handleSelectTab} value={currentTab} />
                </Box>
                <Stack
                    sx={{
                        minHeight: '96px',
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderRadius: ({ shape }) => `${shape.borderRadius}px`,
                        backgroundColor: alpha(theme.palette.secondary.main, 0.12),
                        boxShadow: theme.boxShadow,
                        m: 8,
                    }}
                >
                    <Typography fontSize={22} fontFamily={'Noto Sans SC'}>
                        SEAL
                        <Typography fontSize={12} fontFamily={'Noto Sans SC'} component="span">
                            {` v${VERSION}`}
                        </Typography>
                    </Typography>
                    <Typography fontSize={22} fontFamily={'Noto Sans SC'}>
                        Core
                        <Typography fontSize={12} fontFamily={'Noto Sans SC'} component="span">
                            {` v${CoreLoader.version}`}
                        </Typography>
                    </Typography>
                </Stack>
            </Stack>
            <Stack
                id={`vertical-tabpanel-${currentTab}`}
                aria-labelledby={`vertical-tab-${currentTab}`}
                role="tabpanel"
                sx={{ overflowY: 'auto', width: '100%' }}
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
                        <Box id="tab-view-transition-ref">{currentView}</Box>
                    </Fade>
                </SwitchTransition>
            </Stack>
        </Stack>
    );
}
