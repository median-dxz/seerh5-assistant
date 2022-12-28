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
import { Battle } from '@sa-core/index';
import { mainColor } from '@sa-ui/style';
import React from 'react';
import { PanelTableBase, PanelTableBodyRow } from '../base';

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

const setTopItem = (arr: any[], index: number) => {
    const i = arr.splice(index, 1)[0];
    arr = [i, ...arr];
    return arr;
};

const delItem = (arr: any[], index: number) => {
    arr.splice(index, 1);
    arr = [...arr];
    return arr;
};

const setItemValue = <T extends {}>(arr: T[], index: number, value: T) => {
    arr[index] = value;
    arr = [...arr];
    return arr;
};

const addItem = <T extends {}>(arr: T[], value: T) => {
    arr = [...arr, value];
    return arr;
};

const tableHeads = ['优先级', '技能组', '操作'];

export function BattleManager() {
    const [auto, setAuto] = React.useState(Battle.Manager.running);
    const [skillNameMatch, setSNM] = React.useState(Battle.Manager.strategy.snm);
    const [diedSwitchLink, setDSL] = React.useState(Battle.Manager.strategy.dsl);

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
            setAuto(Battle.Manager.running);
            setSNM(Battle.Manager.strategy.snm);
            setDSL(Battle.Manager.strategy.dsl);
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
                            Battle.Manager.running = newValue;
                        }}
                    />
                }
                label="自动战斗状态"
            />
            <Button
                onClick={() => {
                    Battle.Manager.strategy.custom = undefined;
                }}
            >
                清除自定义逻辑
            </Button>
            <Button
                onClick={() => {
                    Battle.Manager.lockingTrigger = undefined;
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
                            if (value) {
                                Battle.Manager.strategy.snm = addItem(
                                    Battle.Manager.strategy.snm,
                                    value.split(',')
                                );
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
            <PanelTableBase
                heads={tableHeads.map((r, i) => (
                    <TableCell key={i} align="center">
                        {r}
                    </TableCell>
                ))}
            >
                {skillNameMatch.map((row, index) => (
                    <PanelTableBodyRow key={index}>
                        <TableCell component="th" scope="row" align="center">
                            {index + 1}
                        </TableCell>
                        <TableCell align="center">{row.join(',')}</TableCell>
                        <TableCell align="center">
                            <Button
                                onClick={() => {
                                    Battle.Manager.strategy.snm = setTopItem(
                                        Battle.Manager.strategy.snm,
                                        index
                                    );
                                }}
                            >
                                置顶
                            </Button>
                            <Button
                                onClick={() => {
                                    Battle.Manager.strategy.snm = delItem(
                                        Battle.Manager.strategy.snm,
                                        index
                                    );
                                }}
                            >
                                删除
                            </Button>
                            <Button
                                onClick={() => {
                                    showDialog({
                                        onClose: (value) => {
                                            if (value) {
                                                Battle.Manager.strategy.snm = setItemValue(
                                                    Battle.Manager.strategy.snm,
                                                    index,
                                                    value.split(',')
                                                );
                                            }
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
                    </PanelTableBodyRow>
                ))}
            </PanelTableBase>

            <Divider />
            <h3>死切链</h3>
            <Button
                onClick={() => {
                    showDialog({
                        onClose: (value) => {
                            if (value) {
                                Battle.Manager.strategy.dsl = addItem(
                                    Battle.Manager.strategy.dsl,
                                    value.split(',')
                                );
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
                        <PanelTableBodyRow key={index}>
                            <TableCell component="th" scope="row" align="center">
                                {index + 1}
                            </TableCell>
                            <TableCell align="center">{row.join(',')}</TableCell>
                            <TableCell align="center">
                                <Button
                                    onClick={() => {
                                        Battle.Manager.strategy.dsl = setTopItem(
                                            Battle.Manager.strategy.dsl,
                                            index
                                        );
                                    }}
                                >
                                    置顶
                                </Button>
                                <Button
                                    onClick={() => {
                                        Battle.Manager.strategy.dsl = delItem(
                                            Battle.Manager.strategy.dsl,
                                            index
                                        );
                                    }}
                                >
                                    删除
                                </Button>
                                <Button
                                    onClick={() => {
                                        showDialog({
                                            onClose: (value) => {
                                                if (value) {
                                                    Battle.Manager.strategy.dsl = setItemValue(
                                                        Battle.Manager.strategy.dsl,
                                                        index,
                                                        value.split(',')
                                                    );
                                                }
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
                        </PanelTableBodyRow>
                    ))}
                </TableBody>
            </Table>
        </>
    );
}
