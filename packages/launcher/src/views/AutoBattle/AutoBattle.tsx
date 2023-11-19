import { Button, Divider, FormControlLabel, Switch } from '@mui/material';

import React, { useState, type ReactNode } from 'react';

import { PanelField, PanelTable, useRowData } from '@sea-launcher/components/PanelTable';
import { useIndex } from '@sea-launcher/components/PanelTable/usePanelTableData';
import { SeaTableRow } from '@sea-launcher/components/styled/TableRow';
import { SEAContext } from '@sea-launcher/context/SAContext';
import * as SALocalStorage from '@sea-launcher/utils/hooks/SALocalStorage';
import { TextEditDialog } from '@sea-launcher/views/AutoBattle/TextEditDialog';
import { NOOP } from 'sea-core';
import * as Battle from 'sea-core/battle';

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

const strategyStorage = SALocalStorage.BattleStrategy;

// 待编辑文本的上下文
export const TextContext = React.createContext(
    {} as { text: string; setText: React.Dispatch<React.SetStateAction<string>> }
);

export function AutoBattle() {
    const { Battle: battleContext } = React.useContext(SEAContext);
    const { enableAuto: auto, updateAuto } = battleContext;
    const [strategy, setStrategy] = useState(strategyStorage.ref);

    const [open, setOpen] = useState(false);
    const [text, setText] = useState('');
    const [onClose, setOnClose] = useState<(value: string) => void>(() => NOOP);

    const openDialog = (callback: (value: string) => void, value = '') => {
        setOpen(true);
        setText(value);
        setOnClose(() => {
            return (value: string) => {
                setOpen(false);
                setText('');
                callback(value);
            };
        });
    };

    const skillRow: PanelRowChildren<string[][]> = (data, index) => {
        return (
            <>
                <PanelField field="priority">{index + 1}</PanelField>
                <PanelField field="skillGroup">{data.join(', ')}</PanelField>
                <PanelField field="operation">
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
                            }, data.join(', '));
                        }}
                    >
                        编辑
                    </Button>
                </PanelField>
            </>
        );
    };
    const petRow: PanelRowChildren<string[][]> = (data, index) => {
        return (
            <>
                <PanelField field="priority">{index + 1}</PanelField>
                <PanelField field="skillGroup">{data.join(', ')}</PanelField>
                <PanelField field="operation">
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
                            }, data.join(', '));
                        }}
                    >
                        编辑
                    </Button>
                </PanelField>
            </>
        );
    };

    return (
        <>
            <TextContext.Provider value={{ text, setText }}>
                <TextEditDialog open={open} onClose={onClose} />
            </TextContext.Provider>

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
                    openDialog((value) => {
                        if (value) {
                            strategyStorage.use((strategy) => {
                                handleAdd(strategy.snm, value);
                            });
                            setStrategy(strategyStorage.ref);
                        }
                    });
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
                rowElement={<PanelRow>{skillRow}</PanelRow>}
                toRowKey={(data) => data.join(',')}
            />

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
                    });
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
                rowElement={<PanelRow>{petRow}</PanelRow>}
                toRowKey={(data) => data.join(',')}
            />
        </>
    );
}

type PanelRowChildren<TData> = (data: TData, index: number) => ReactNode;

const PanelRow = React.memo(function PanelRow({ children }: { children: PanelRowChildren<never> }) {
    const data = useRowData<never>();
    const index = useIndex();
    return <SeaTableRow>{children(data, index)}</SeaTableRow>;
});
