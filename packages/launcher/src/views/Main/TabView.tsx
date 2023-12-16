import { Fade, Paper, Tabs, Typography, useTheme } from '@mui/material';
import { alpha, Box, Stack } from '@mui/system';
import React, { forwardRef, type ReactElement } from 'react';
import { SwitchTransition } from 'react-transition-group';
import { CoreLoader } from 'sea-core';

import { VERSION } from '@/constants';
import { useTabRouter, type ViewNode } from '@/context/useTabRouter';
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
    const {
        border,
        transitions: { easing },
        boxShadow,
        palette: { primary },
    } = useTheme();

    return (
        <SwitchTransition>
            <Fade
                key={routerStack.length}
                timeout={150}
                appear={false}
                mountOnEnter
                unmountOnExit
                easing={{
                    enter: easing.easeOut,
                    exit: easing.easeInOut,
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
                            boxShadow: boxShadow,
                            backgroundColor: alpha(primary.main, 0.12),
                            border: border,
                        },
                        '& .Mui-selected:active': {
                            backgroundColor: alpha(primary.main, 0.24),
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
    const {
        boxShadow,
        border,
        palette: { primary },
        transitions: { easing },
    } = useTheme();

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

    const handleSelectTab = (idx: number) => {
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
    };

    return (
        <Stack
            direction="row"
            sx={{ width: '100vw', height: '100vh', alignItems: 'stretch', justifyContent: 'stretch' }}
        >
            <Stack
                sx={{
                    borderRight: border,
                    boxShadow: boxShadow,
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
                            backgroundColor: alpha(primary.main, 0.24),
                        },
                    }}
                >
                    <TabsGroup tabs={currentViewNodes} onSelect={handleSelectTab} value={currentTab} />
                </Box>
                <Paper
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        minHeight: '96px',
                        justifyContent: 'center',
                        alignItems: 'center',
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
                </Paper>
            </Stack>
            <SwitchTransition>
                <Fade
                    key={`${routerStack.length}:${currentTab}`}
                    timeout={150}
                    appear={false}
                    mountOnEnter
                    unmountOnExit
                    easing={{
                        enter: easing.easeOut,
                        exit: easing.easeInOut,
                    }}
                >
                    <Box
                        id={`vertical-tabpanel-${currentTab}`}
                        aria-labelledby={`vertical-tab-${currentTab}`}
                        role="tabpanel"
                        sx={{ paddingLeft: '12px', overflowY: 'scroll', width: '100%' }}
                    >
                        {currentView}
                    </Box>
                </Fade>
            </SwitchTransition>
        </Stack>
    );
}
