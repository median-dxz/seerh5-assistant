import { Box, Grow, Tab, Tabs, Typography, useTheme } from '@mui/material';
import { mainColor } from '@sa-ui/style';
import * as React from 'react';
import { PanelDailyRoutine } from '../PanelDailyRoutine/PanelDailyRoutine';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`vertical-tabpanel-${index}`}
            aria-labelledby={`vertical-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    <Typography>{children}</Typography>
                </Box>
            )}
        </div>
    );
}

function a11yProps(index: number) {
    return {
        id: `vertical-tab-${index}`,
        'aria-controls': `vertical-tabpanel-${index}`,
    };
}

interface Props {
    show: boolean;
}

export function MainPanel(props: Props) {
    const [value, setValue] = React.useState(0);

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    return (
        <Grow in={props.show} unmountOnExit>
            <Box
                sx={{
                    position: 'absolute',
                    display: 'flex',
                    top: '12vh',
                    left: 'calc((100vw - 60vw) / 2)',
                    width: '60vw',
                    height: '75vh',
                    zIndex: 1,
                    color: `rgba(${mainColor.front} / 100%)`,
                    bgcolor: `rgba(${mainColor.back} / 30%)`,
                    border: `2px solid rgba(${mainColor.front} / 75%)`,
                    boxShadow: `0 0 16px rgba(${mainColor.front} / 50%),
                    0 0 16px rgba(${mainColor.back} / 50%) inset`,
                }}
            >
                <Tabs
                    orientation="vertical"
                    value={value}
                    onChange={handleChange}
                    variant="fullWidth"
                    aria-label="SA Main Panel Tabs"
                    sx={{
                        bgcolor: `rgba(${mainColor.back} / 12%)`,
                        // backdropFilter: `blur(0px)`,
                        borderRight: 1,
                        borderColor: 'rgba(255 255 255 / 12%)',
                        paddingBlockStart: '10%',
                    }}
                >
                    <Tab label="快捷命令组" {...a11yProps(0)} />
                    <Tab label="常用数据速览" {...a11yProps(1)} />
                    <Tab label="一键日常" {...a11yProps(2)} />
                    <Tab label="精灵背包" {...a11yProps(3)} />
                    <Tab label="自动战斗管理器" {...a11yProps(4)} />
                    <Tab label="抓包调试" {...a11yProps(5)} />
                </Tabs>
                <TabPanel value={value} index={0}>
                    Item One
                </TabPanel>
                <TabPanel value={value} index={1}>
                    Item Two
                </TabPanel>
                <TabPanel value={value} index={2}>
                    <PanelDailyRoutine />
                </TabPanel>
                <TabPanel value={value} index={3}>
                    Item Four
                </TabPanel>
                <TabPanel value={value} index={4}>
                    Item Five
                </TabPanel>
                <TabPanel value={value} index={5}>
                    Item Six
                </TabPanel>
            </Box>
        </Grow>
    );
}
