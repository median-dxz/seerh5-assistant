import { Button, Divider, FormControlLabel, Switch } from '@mui/material';

import React, { useState } from 'react';

import { PanelTable } from '@sa-app/components/PanelTable/PanelTable';
import { TextEditDialog, TextEditDialogProps } from '@sa-app/components/TextEditDialog';
import { SAContext } from '@sa-app/context/SAContext';
import * as SALocalStorage from '@sa-app/utils/hooks/SALocalStorage';
import { NULL } from 'sa-core';
import * as SABattle from 'sa-core/battle';

const handleAdd = (arr: unknown[], value: string) => {
    arr.push(value.split(',').map((s) => s.trim()));
};

const handleMoveToTop = (arr: unknown[], index: number) => {
    const item = arr.splice(index, 1)[0];
    arr.unshift(item);
};
const handleDelete = (arr: unknown[], index: number) => {
    arr.splice(index, 1);
};

const handleUpdated = (arr: unknown[], index: number, value: string) => {
    arr[index] = value.split(',').map((s) => s.trim());
};

const defaultDialogState: TextEditDialogProps = {
    onClose: NULL,
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
    }, [setDialogState]);

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
            <PanelTable
                columns={[
                    {
                        field: 'priority',
                        columnName: '优先级',
                    },
                    {
                        field: 'skillGroup',
                        columnName: '技能组',
                    },
                    {
                        field: 'operation',
                        columnName: '操作',
                    },
                ]}
                data={strategy.snm}
                columnRender={(row, index) => ({
                    priority: index + 1,
                    skillGroup: row.join(', '),
                    operation: (
                        <>
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
                        </>
                    ),
                })}
            ></PanelTable>

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
            <PanelTable
                data={strategy.dsl}
                columns={[
                    {
                        field: 'priority',
                        columnName: '优先级',
                    },
                    {
                        field: 'petLink',
                        columnName: '死切链',
                    },
                    {
                        field: 'operation',
                        columnName: '操作',
                    },
                ]}
                columnRender={(row, index) => ({
                    priority: index + 1,
                    petLink: row.join(', '),
                    operation: (
                        <>
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
                        </>
                    ),
                })}
            />
        </>
    );
}
