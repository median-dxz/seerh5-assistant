import { ElectricBolt } from '@mui/icons-material';
import Lock from '@mui/icons-material/Lock';
import { Backdrop, Box, Fade, Switch, SxProps, Tab, Tabs } from '@mui/material';
import { HexagonalButton } from '@sa-app/components/styled/HexagonalButton';
import { PanelStateContext } from '@sa-app/context/PanelState';
import * as React from 'react';
import { AutoBattle } from './AutoBattle/AutoBattle';
import { CommonValue } from './CommonValue';
import { GameController } from './GameController';
import { PackageCapture } from './PackageCapture';
import { QuickCommand } from './QuickCommand';
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

export function MainPanel() {
    const [value, setValue] = React.useState(0);
    const [open, setOpen] = React.useState(false);
    const [lock, setLock] = React.useState(false);

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    function dispatchClickEvent(e: React.TouchEvent | React.MouseEvent) {
        if (!lock) {
            return;
        }
        const canvas: HTMLCanvasElement = document.querySelector('#egret_player_container canvas')!;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        <PanelStateContext.Provider
            value={{
                open,
                setOpen,
                lock,
                setLock,
            }}
        >
            <HexagonalButton
                baseSize={32}
                sx={{ top: '10vh', left: '6vw', position: 'absolute', zIndex: (theme) => theme.zIndex.appBar }}
                onClick={() => {
                    setOpen((preState) => !preState);
                }}
            >
                <ElectricBolt />
            </HexagonalButton>
            <Fade in={open}>
                <Backdrop
                    sx={{ bgcolor: 'rgba(0, 0, 0, 0.75)', zIndex: (theme) => theme.zIndex.appBar - 1 }}
                    open={open}
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
                            left: 'calc(30vw / 2)',
                            width: '70vw',
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
                                    checked={lock}
                                    onChange={(e, newValue) => {
                                        setLock(newValue);
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
        </PanelStateContext.Provider>
    );
}
