import ElectricBolt from '@mui/icons-material/ElectricBolt';
import Lock from '@mui/icons-material/Lock';
import { Backdrop, Box, Fade, Slide, Switch, Tab, Tabs, type SxProps, type TabProps } from '@mui/material';
import { HexagonalButton } from '@sea-launcher/components/styled/HexagonalButton';
import { PanelStateContext } from '@sea-launcher/context/PanelState';
import { saTheme } from '@sea-launcher/style';
import * as React from 'react';
import { TransitionGroup } from 'react-transition-group';
import { AutoBattle } from './AutoBattle/AutoBattle';
import { CommonValue } from './CommonValue';
import { DailySign } from './DailySign';
import { GameController } from './GameController';
import { PackageCapture } from './PackageCapture';
import { PetFragmentLevelPanel } from './PetFragmentLevel';
import { QuickCommand } from './QuickCommand';
import { Realm } from './Realm';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
    onClick?: React.MouseEventHandler<HTMLDivElement>;
}

enum TabLayer {
    Main,
    Level,
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
    const containerRef = React.useRef<HTMLDivElement>(null);
    const [layer, setLayer] = React.useState(TabLayer.Main);

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

    let tabGroup: React.ReactElement<TabProps> = <Tabs />;

    const panelLayer = {
        [TabLayer.Main]: [
            <GameController />,
            undefined,
            <CommonValue />,
            <AutoBattle />,
            <PackageCapture />,
            <QuickCommand />,
        ],
        [TabLayer.Level]: [undefined, <DailySign />, <Realm />, <PetFragmentLevelPanel />, <Realm />],
    };

    switch (layer) {
        case TabLayer.Main:
            tabGroup = (
                <Tabs
                    orientation="vertical"
                    sx={{ position: 'absolute', left: 0, top: 0, minWidth: '100%' }}
                    value={value}
                    onChange={handleChange}
                >
                    <Tab label="精灵背包" {...a11yProps(0)} />
                    <Tab
                        label="一键日常"
                        {...a11yProps(1)}
                        onClick={() => {
                            setLayer(TabLayer.Level);
                            setValue(1);
                        }}
                    />
                    <Tab label="常用数据速览" {...a11yProps(2)} />
                    <Tab label="自动战斗管理器" {...a11yProps(3)} />
                    <Tab label="抓包调试" {...a11yProps(4)} />
                    <Tab label="快捷命令组" {...a11yProps(5)} />
                </Tabs>
            );
            break;
        case TabLayer.Level:
            tabGroup = (
                <Tabs
                    orientation="vertical"
                    sx={{ position: 'absolute', left: 0, top: 0, minWidth: '100%' }}
                    value={value}
                    onChange={handleChange}
                >
                    <Tab
                        label="返回"
                        {...a11yProps(0)}
                        onClick={() => {
                            setLayer(TabLayer.Main);
                            setValue(0);
                        }}
                    />
                    <Tab label="签到" {...a11yProps(1)} />
                    <Tab label="日任" {...a11yProps(2)} />
                    <Tab label="精灵因子" {...a11yProps(3)} />
                    <Tab label="spt" {...a11yProps(4)} />
                </Tabs>
            );
            break;
        default:
            break;
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
                            overflowX: 'hidden',
                        }}
                        onClick={(e) => {
                            e.nativeEvent.stopPropagation();
                        }}
                    >
                        <Box
                            sx={{
                                width: '155px',
                                minWidth: '155px',
                                borderRight: 1,
                                borderColor: 'rgba(255 255 255 / 12%)',
                                paddingBlockStart: '10%',
                                display: 'flex',
                                flexDirection: 'column',
                            }}
                            ref={containerRef}
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
                            <Box
                                id="tabs-group"
                                sx={{
                                    overflowX: 'hidden',
                                    position: 'relative',
                                    height: '100%',
                                    width: '100%',
                                }}
                            >
                                <TransitionGroup component={null}>
                                    <Slide
                                        timeout={600}
                                        container={containerRef.current}
                                        direction={layer === TabLayer.Main ? 'left' : 'right'}
                                        appear={false}
                                        easing={{
                                            enter: saTheme.transitions.easing.easeOut,
                                            exit: saTheme.transitions.easing.easeIn,
                                        }}
                                        key={layer}
                                    >
                                        {tabGroup}
                                    </Slide>
                                </TransitionGroup>
                            </Box>
                        </Box>

                        {panelLayer[layer].map((panel, index) => (
                            <TabPanel key={`${layer}-${index}`} value={value} index={index}>
                                {panel}
                            </TabPanel>
                        ))}
                    </Box>
                </Backdrop>
            </Fade>
        </PanelStateContext.Provider>
    );
}
