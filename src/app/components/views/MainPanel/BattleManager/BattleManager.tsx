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
    TableCell,
    TextField,
} from '@mui/material';
import { SAContext } from '@sa-app/context/SAContext';
import { mainColor } from '@sa-app/style';
import { Battle } from '@sa-core/index';
import produce from 'immer';
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

const handleAdd = (arr: any[], value: string) => {
    arr.push(value.split(','));
};

const handleMoveToTop = (arr: any[], index: number) => {
    const item = arr.splice(index, 1)[0];
    arr.unshift(item);
};

const handleDelete = (arr: any[], index: number) => {
    arr.splice(index, 1);
};

const handleUpdated = (arr: any[], index: number, value: string) => {
    arr[index] = value.split(',');
};

export function BattleManager() {
    const { Battle: battleContext } = React.useContext(SAContext);
    const { enableAuto: auto, updateAuto, strategy, updateStrategy } = battleContext;

    const closeDialog = {
        onClose: () => {},
        open: false,
        value: '',
    };

    const [dialogProps, setDialog] = React.useState<TextEditDialogProps>(
        React.useCallback(
            () => ({
                onClose: () => {},
                open: false,
                value: '',
            }),
            []
        )
    );

    const withStrategy = (operator: (baseState: Battle.AutoBattle.Strategy) => void) =>
        updateStrategy(
            produce(strategy, (draft) => {
                operator(draft);
            })
        );

    return (
        <>
            <TextEditDialog {...dialogProps} />
            <FormControlLabel
                control={
                    <Switch
                        checked={auto}
                        onChange={(e, checked) => {
                            updateAuto(checked);
                        }}
                    />
                }
                label="自动战斗状态"
            />
            <Button
                onClick={() => {
                    Battle.Manager.clear();
                }}
            >
                一键复位
            </Button>
            <Divider />
            <h3>出招表</h3>
            <Button
                onClick={() => {
                    setDialog({
                        onClose: (value) => {
                            if (value) {
                                withStrategy((strategy) => {
                                    handleAdd(strategy.snm, value);
                                });
                            }
                            setDialog(closeDialog);
                        },
                        open: true,
                        value: '',
                    });
                }}
            >
                添加
            </Button>
            <PanelTableBase
                size="small"
                aria-label="skill match settings"
                heads={
                    <>
                        <TableCell align="center">优先级</TableCell>
                        <TableCell align="center">技能组</TableCell>
                        <TableCell align="center">操作</TableCell>
                    </>
                }
            >
                {strategy.snm.map((row, index) => (
                    <PanelTableBodyRow key={index}>
                        <TableCell component="th" scope="row" align="center">
                            {index + 1}
                        </TableCell>
                        <TableCell align="center">{row.join(',')}</TableCell>
                        <TableCell align="center">
                            <Button
                                onClick={() => {
                                    withStrategy((strategy) => {
                                        handleMoveToTop(strategy.snm, index);
                                    });
                                }}
                            >
                                置顶
                            </Button>
                            <Button
                                onClick={() => {
                                    withStrategy((strategy) => {
                                        handleDelete(strategy.snm, index);
                                    });
                                }}
                            >
                                删除
                            </Button>
                            <Button
                                onClick={() => {
                                    setDialog({
                                        onClose: (value) => {
                                            if (value) {
                                                withStrategy((strategy) => {
                                                    handleUpdated(strategy.snm, index, value);
                                                });
                                            }
                                            setDialog(closeDialog);
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
                    setDialog({
                        onClose: (value) => {
                            if (value) {
                                withStrategy((strategy) => {
                                    handleAdd(strategy.dsl, value);
                                });
                            }
                            setDialog(closeDialog);
                        },
                        open: true,
                        value: '',
                    });
                }}
            >
                添加
            </Button>
            <PanelTableBase
                size="small"
                aria-label="died switch link settings"
                heads={
                    <>
                        <TableCell align="center">优先级</TableCell>
                        <TableCell align="center">精灵链</TableCell>
                        <TableCell align="center">操作</TableCell>
                    </>
                }
            >
                {strategy.dsl.map((row, index) => (
                    <PanelTableBodyRow key={index}>
                        <TableCell component="th" scope="row" align="center">
                            {index + 1}
                        </TableCell>
                        <TableCell align="center">{row.join(',')}</TableCell>
                        <TableCell align="center">
                            <Button
                                onClick={() => {
                                    withStrategy((strategy) => {
                                        handleMoveToTop(strategy.dsl, index);
                                    });
                                }}
                            >
                                置顶
                            </Button>
                            <Button
                                onClick={() => {
                                    withStrategy((strategy) => {
                                        handleDelete(strategy.dsl, index);
                                    });
                                }}
                            >
                                删除
                            </Button>
                            <Button
                                onClick={() => {
                                    setDialog({
                                        onClose: (value) => {
                                            if (value) {
                                                withStrategy((strategy) => {
                                                    handleUpdated(strategy.dsl, index, value);
                                                });
                                            }
                                            setDialog(closeDialog);
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
        </>
    );
}
