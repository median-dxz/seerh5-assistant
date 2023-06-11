import Lock from '@mui/icons-material/Lock';
import { Backdrop, Box, Fade, Switch, SxProps, Tab, Tabs } from '@mui/material';
import * as React from 'react';
import { CommonValue } from './CommonValue';
import { GameController } from './GameController';
import { PackageCapture } from './PackageCapture';
import { QuickCommand } from './QuickCommand';
import { AutoBattle } from './AutoBattle';
import { Realm } from './Realm';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps & { sx?: SxProps }) {
    const { sx, children, value, index, ...other } = props;

    return (
        <Box
            sx={{
                p: 1,
                width: '100%',
                overflowY: 'auto',
                overflowX: 'hidden',
                marginRight: '-1px',
                '&::-webkit-scrollbar': {
                    width: 8,
                    height: 8,
                },
                '&::-webkit-scrollbar-track': {},
                '&::-webkit-scrollbar-thumb': {},
                ...sx,
            }}
            role="tabpanel"
            hidden={value !== index}
            id={`vertical-tabpanel-${index}`}
            aria-labelledby={`vertical-tab-${index}`}
            {...other}
        >
            {value === index && children}
        </Box>
    );
}

function a11yProps(index: number) {
    return {
        id: `vertical-tab-${index}`,
        'aria-controls': `vertical-tabpanel-${index}`,
    };
}

interface Props {
    lock: boolean;
    show: boolean;
    setLock: (lock: boolean) => void;
}

export function MainPanel(props: Props) {
    const [value, setValue] = React.useState(0);

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    function dispatchClickEvent(e: React.TouchEvent | React.MouseEvent) {
        if (!props.lock) {
            return;
        }
        const canvas: HTMLCanvasElement = document.querySelector('#egret_player_container canvas')!;
        const eventProperty: any = {};
        for (const k in e.nativeEvent) {
            eventProperty[k] = e.nativeEvent[k as keyof typeof e.nativeEvent];
        }
        if (e.nativeEvent instanceof MouseEvent) {
            canvas.dispatchEvent(new MouseEvent(e.type, eventProperty));
        } else if (e.nativeEvent instanceof TouchEvent) {
            canvas.dispatchEvent(new TouchEvent(e.type, eventProperty));
        }
    }

    return (
        <Fade in={props.show}>
            <Backdrop
                sx={{ zIndex: 2 }}
                open={props.show}
                onTouchCancel={dispatchClickEvent}
                onTouchStart={dispatchClickEvent}
                onTouchEnd={dispatchClickEvent}
                onMouseUp={dispatchClickEvent}
                onMouseDown={dispatchClickEvent}
            >
                <Box
                    sx={{
                        position: 'absolute',
                        display: 'flex',
                        left: 'calc(40vw / 2)',
                        width: '60vw',
                        height: '100%',
                        overflowY: 'scroll',
                        overflowX: 'hidden',
                    }}
                    onClick={(e) => {
                        e.nativeEvent.stopPropagation();
                    }}
                >
                    <Box
                        sx={{
                            minWidth: '155px',
                            borderRight: 1,
                            borderColor: 'rgba(255 255 255 / 12%)',
                            paddingBlockStart: '10%',
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Lock />
                            <Switch
                                checked={props.lock}
                                onChange={(e, newValue) => {
                                    props.setLock(newValue);
                                }}
                            />
                        </Box>

                        <Tabs
                            orientation="vertical"
                            value={value}
                            onChange={handleChange}
                            aria-label="SA Main Panel Tabs"
                        >
                            <Tab label="精灵背包" {...a11yProps(0)} />
                            <Tab label="一键日常" {...a11yProps(1)} />
                            <Tab label="常用数据速览" {...a11yProps(2)} />
                            <Tab label="自动战斗管理器" {...a11yProps(3)} />
                            <Tab label="抓包调试" {...a11yProps(4)} />
                            <Tab label="快捷命令组" {...a11yProps(5)} />
                        </Tabs>
                    </Box>

                    <TabPanel value={value} index={0}>
                        <GameController />
                    </TabPanel>
                    <TabPanel value={value} index={1}>
                        <Realm />
                    </TabPanel>
                    <TabPanel value={value} index={2}>
                        <CommonValue />
                    </TabPanel>
                    <TabPanel value={value} index={3}>
                        <AutoBattle />
                    </TabPanel>
                    <TabPanel value={value} index={4}>
                        <PackageCapture />
                    </TabPanel>
                    <TabPanel value={value} index={5}>
                        <QuickCommand />
                    </TabPanel>
                </Box>
            </Backdrop>
        </Fade>
    );
}
