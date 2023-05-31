import { Button, Divider, FormControlLabel, Switch, TableCell } from '@mui/material';

import React, { useState } from 'react';

import { TextEditDialog, TextEditDialogProps } from '@sa-app/components/common/TextEditDialog';
import { SAContext } from '@sa-app/context/SAContext';
import { SALocalStorage } from '@sa-app/hooks/GlobalConfig';
import * as SABattle from 'sa-core/battle';
import { PanelTableBase, PanelTableBodyRow } from '../base';

const handleAdd = (arr: any[], value: string) => {
    arr.push(value.split(',').map((s) => s.trim()));
};

const handleMoveToTop = (arr: any[], index: number) => {
    const item = arr.splice(index, 1)[0];
    arr.unshift(item);
};
const handleDelete = (arr: any[], index: number) => {
    arr.splice(index, 1);
};

const handleUpdated = (arr: any[], index: number, value: string) => {
    arr[index] = value.split(',').map((s) => s.trim());
};

const defaultDialogState: TextEditDialogProps = {
    onClose: () => {},
    open: false,
    initialValue: '',
};

const strategyStorage = SALocalStorage.BattleStrategy;

export function AutoBattle() {
    const { Battle: battleContext } = React.useContext(SAContext);
    const { enableAuto: auto, updateAuto } = battleContext;

    const [strategy, setStrategy] = useState(strategyStorage.ref);

    const [dialogProps, setDialogState] = React.useState<TextEditDialogProps>(defaultDialogState);

    const closeDialog = React.useCallback(() => {
        setDialogState(defaultDialogState);
    }, [dialogProps]);

    const openDialog = (onClose: (value: string) => void, initialValue: string) => {
        setDialogState({ open: true, initialValue, onClose });
    };

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
                    SABattle.Manager.clear();
                }}
            >
                一键复位
            </Button>
            <Divider />
            <h3>出招表</h3>
            <Button
                onClick={() => {
                    openDialog((value) => {
                        if (value) {
                            strategyStorage.use((strategy) => {
                                handleAdd(strategy.snm, value);
                            });
                            setStrategy(strategyStorage.ref);
                        }
                        closeDialog();
                    }, '');
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
                        <TableCell align="center">{row.join(', ')}</TableCell>
                        <TableCell align="center">
                            <Button
                                onClick={() => {
                                    strategyStorage.use((strategy) => {
                                        handleMoveToTop(strategy.snm, index);
                                    });
                                    setStrategy(strategyStorage.ref);
                                }}
                            >
                                置顶
                            </Button>
                            <Button
                                onClick={() => {
                                    strategyStorage.use((strategy) => {
                                        handleDelete(strategy.snm, index);
                                    });
                                    setStrategy(strategyStorage.ref);
                                }}
                            >
                                删除
                            </Button>
                            <Button
                                onClick={() => {
                                    openDialog((value) => {
                                        if (value) {
                                            strategyStorage.use((strategy) => {
                                                handleUpdated(strategy.snm, index, value);
                                            });
                                            setStrategy(strategyStorage.ref);
                                        }
                                        closeDialog();
                                    }, row.join(', '));
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
                    openDialog((value) => {
                        if (value) {
                            strategyStorage.use((strategy) => {
                                handleAdd(strategy.dsl, value);
                            });
                            setStrategy(strategyStorage.ref);
                        }
                        closeDialog();
                    }, '');
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
                        <TableCell align="center">{row.join(', ')}</TableCell>
                        <TableCell align="center">
                            <Button
                                onClick={() => {
                                    strategyStorage.use((strategy) => {
                                        handleMoveToTop(strategy.dsl, index);
                                    });
                                    setStrategy(strategyStorage.ref);
                                }}
                            >
                                置顶
                            </Button>
                            <Button
                                onClick={() => {
                                    strategyStorage.use((strategy) => {
                                        handleDelete(strategy.dsl, index);
                                    });
                                    setStrategy(strategyStorage.ref);
                                }}
                            >
                                删除
                            </Button>
                            <Button
                                onClick={() => {
                                    openDialog((value) => {
                                        if (value) {
                                            strategyStorage.use((strategy) => {
                                                handleUpdated(strategy.dsl, index, value);
                                            });
                                            setStrategy(strategyStorage.ref);
                                        }
                                        closeDialog();
                                    }, row.join(', '));
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
