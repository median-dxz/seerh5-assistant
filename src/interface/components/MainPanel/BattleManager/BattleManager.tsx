import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Divider,
    FormControlLabel,
    Switch,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField
} from '@mui/material';
import { mainColor } from '@sa-ui/style';
import React from 'react';

interface TextEditDialogProps {
    open: boolean;
    value: string;
    onClose: (value: string) => void;
}

function TextEditDialog(props: TextEditDialogProps) {
    const { open, value: initValue, onClose } = props;
    const [value, setValue] = React.useState(initValue);

    React.useEffect(() => {
        setValue(initValue);
    }, [open]);

    return (
        <Dialog
            open={open}
            onClose={(e, r) => {
                if (r === 'backdropClick') {
                    onClose('');
                } else {
                    onClose(value);
                }
            }}
            sx={{
                '& .MuiDialog-paper': {
                    minWidth: 384,
                    bgcolor: `rgba(${mainColor.front} / 18%)`,
                    backdropFilter: 'blur(4px)',
                },
            }}
        >
            <DialogTitle>编辑</DialogTitle>
            <DialogContent>
                <DialogContentText>以英文逗号分隔</DialogContentText>
                <TextField
                    autoFocus
                    margin="dense"
                    id="text-battle-manager"
                    fullWidth
                    variant="standard"
                    onChange={(e) => {
                        setValue(e.target.value);
                    }}
                    value={value}
                />
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={() => {
                        onClose(value);
                    }}
                >
                    保存
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export function BattleManager() {
    const { BattleModule } = SA;
    const [auto, setAuto] = React.useState(BattleModule.Manager.running);
    const [skillNameMatch, setSNM] = React.useState(BattleModule.Manager.strategy.snm);
    const [diedSwitchLink, setDSL] = React.useState(BattleModule.Manager.strategy.dsl);

    const closeDialog = {
        onClose: () => {},
        open: false,
        value: '',
    };

    const [dialogProps, showDialog] = React.useState<TextEditDialogProps>(() => ({
        onClose: () => {},
        open: false,
        value: '',
    }));

    React.useEffect(() => {
        const { SAEventTarget } = window;
        const StateChanged = 'sa_battle_manager_state_changed';
        const onStateChanged = () => {
            setAuto(BattleModule.Manager.running);
            setSNM([...BattleModule.Manager.strategy.snm]);
            setDSL([...BattleModule.Manager.strategy.dsl]);
        };
        SAEventTarget.addEventListener(StateChanged, onStateChanged);
        return () => {
            SAEventTarget.removeEventListener(StateChanged, onStateChanged);
        };
    });
    return (
        <>
            <TextEditDialog {...dialogProps} />
            <FormControlLabel
                control={
                    <Switch
                        checked={auto}
                        onChange={(e, newValue) => {
                            BattleModule.Manager.running = newValue;
                        }}
                    />
                }
                label="自动战斗状态"
            />
            <Button
                onClick={() => {
                    BattleModule.Manager.strategy.custom = undefined;
                }}
            >
                清除自定义逻辑
            </Button>
            <Button
                onClick={() => {
                    BattleModule.Manager.lockingTrigger = undefined;
                }}
            >
                清除locker
            </Button>
            <Divider />
            <h3>出招表</h3>
            <Button
                onClick={() => {
                    showDialog({
                        onClose: (value) => {
                            let skillNameMatch = BattleModule.Manager.strategy.snm;
                            if (value) {
                                skillNameMatch.splice(0, 0, value.split(','));
                                BattleModule.Manager.strategy.snm = skillNameMatch;
                            }
                            showDialog(closeDialog);
                        },
                        open: true,
                        value: '',
                    });
                }}
            >
                添加
            </Button>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell align="center">优先级</TableCell>
                        <TableCell align="center">技能组</TableCell>
                        <TableCell align="center">操作</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {skillNameMatch.map((row, index) => (
                        <TableRow key={index} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                            <TableCell component="th" scope="row" align="center">
                                {index + 1}
                            </TableCell>
                            <TableCell align="center">{row.join(',')}</TableCell>
                            <TableCell align="center">
                                <Button
                                    onClick={() => {
                                        let skillNameMatch = BattleModule.Manager.strategy.snm;
                                        const i = skillNameMatch.splice(index, 1);
                                        skillNameMatch.splice(0, 0, i[0]);
                                        BattleModule.Manager.strategy.snm = skillNameMatch;
                                    }}
                                >
                                    置顶
                                </Button>
                                <Button
                                    onClick={() => {
                                        let skillNameMatch = BattleModule.Manager.strategy.snm;
                                        skillNameMatch.splice(index, 1);
                                        BattleModule.Manager.strategy.snm = skillNameMatch;
                                    }}
                                >
                                    删除
                                </Button>
                                <Button
                                    onClick={() => {
                                        showDialog({
                                            onClose: (value) => {
                                                let skillNameMatch = BattleModule.Manager.strategy.snm;
                                                skillNameMatch[index] = value.split(',');
                                                BattleModule.Manager.strategy.snm = skillNameMatch;
                                                showDialog(closeDialog);
                                            },
                                            open: true,
                                            value: row.join(','),
                                        });
                                    }}
                                >
                                    编辑
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <Divider />
            <h3>死切链</h3>
            <Button
                onClick={() => {
                    showDialog({
                        onClose: (value) => {
                            let diedSwitchLink = BattleModule.Manager.strategy.dsl;
                            if (value) {
                                diedSwitchLink.splice(0, 0, value.split(','));
                                BattleModule.Manager.strategy.dsl = diedSwitchLink;
                            }
                            showDialog(closeDialog);
                        },
                        open: true,
                        value: '',
                    });
                }}
            >
                添加
            </Button>
            <Table aria-label="capture package table" size="small">
                <TableHead>
                    <TableRow>
                        <TableCell align="center">优先级</TableCell>
                        <TableCell align="center">精灵链</TableCell>
                        <TableCell align="center">操作</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {diedSwitchLink.map((row, index) => (
                        <TableRow key={index} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                            <TableCell component="th" scope="row" align="center">
                                {index + 1}
                            </TableCell>
                            <TableCell align="center">{row.join(',')}</TableCell>
                            <TableCell align="center">
                                <Button
                                    onClick={() => {
                                        let diedSwitchLink = BattleModule.Manager.strategy.dsl;
                                        const i = diedSwitchLink.splice(index, 1);
                                        diedSwitchLink.splice(0, 0, i[0]);
                                        BattleModule.Manager.strategy.dsl = diedSwitchLink;
                                    }}
                                >
                                    置顶
                                </Button>
                                <Button
                                    onClick={() => {
                                        let diedSwitchLink = BattleModule.Manager.strategy.dsl;
                                        diedSwitchLink.splice(index, 1);
                                        BattleModule.Manager.strategy.dsl = diedSwitchLink;
                                    }}
                                >
                                    删除
                                </Button>
                                <Button
                                    onClick={() => {
                                        showDialog({
                                            onClose: (value) => {
                                                let diedSwitchLink = BattleModule.Manager.strategy.dsl;
                                                diedSwitchLink[index] = value.split(',');
                                                BattleModule.Manager.strategy.dsl = diedSwitchLink;
                                                showDialog(closeDialog);
                                            },
                                            open: true,
                                            value: row.join(','),
                                        });
                                    }}
                                >
                                    编辑
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </>
    );
}
