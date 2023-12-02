import { PanelField, PanelTable, useRowData, type PanelColumns } from '@/components/PanelTable';
import React from 'react';

import { BaseMod, SEAModType, type SignModExport } from '@/service/mod/type';
import { ModStore } from '@/service/store/mod';
import { Button, ButtonGroup, CircularProgress } from '@mui/material';

import { SeaTableRow } from '@/components/styled/TableRow';
import { delay } from 'sea-core';
import useSWR from 'swr';

export function DailySign() {
    const data = Array.from(ModStore)
        .filter(([_, mod]) => {
            return mod.meta.type === SEAModType.SIGN_MOD;
        })
        .map(([_, mod]) => mod);

    const columns: PanelColumns = React.useMemo(
        () => [
            {
                field: 'name',
                columnName: '名称',
            },
            {
                field: 'description',
                columnName: '描述',
            },
            {
                field: 'scope',
                columnName: 'Scope',
            },
            {
                field: 'state',
                columnName: '状态',
            },
            {
                field: 'execute',
                columnName: '执行',
            },
        ],
        []
    );

    const handleRunAllSign = async () => {
        for (const mod of data) {
            const exports = mod.export as Record<string, SignModExport>;
            for (const [name, { check, run }] of Object.entries(exports)) {
                console.log(`正在执行${name}`);
                let r = await check();
                while (r--) {
                    run();
                    await delay(50);
                }
            }
        }
    };

    return (
        <>
            <Button onClick={handleRunAllSign}>一键执行</Button>
            <PanelTable data={data} columns={columns} rowElement={<PanelRow />} toRowKey={(mod) => mod.namespace} />
        </>
    );
}

interface SignStateProps {
    namespace: string;
    checkers: Record<string, SignModExport>;
}

const SignState: React.FC<SignStateProps> = ({ namespace, checkers }) => {
    const { data: states } = useSWR(`ds://mod/sign/check/${namespace}`, async () => {
        const items = Object.keys(checkers);
        return Promise.all(
            items.map((item) => {
                // console.log(`正在检查${item}`);
                return checkers[item].check();
            })
        );
    });

    return !states ? <CircularProgress /> : `已完成: ${states.filter((n) => n === 0).length} / ${states.length}`;
};

const PanelRow = () => {
    const ins = useRowData<BaseMod>();
    const exports = ins.export as Record<string, SignModExport>;
    const { meta, namespace } = ins;

    return (
        <SeaTableRow>
            <PanelField field="name">{meta.id}</PanelField>
            <PanelField field="description">{meta.description}</PanelField>
            <PanelField field="scope">{meta.scope}</PanelField>
            <PanelField field="state">
                <SignState namespace={namespace} checkers={exports} />
            </PanelField>
            <PanelField field="execute">
                <ButtonGroup>
                    <Button
                        onClick={async () => {
                            for (const [name, { check, run }] of Object.entries(exports)) {
                                console.log(`正在执行${name}`);
                                let r = await check();
                                while (r--) {
                                    run();
                                    await delay(50);
                                }
                            }
                        }}
                    >
                        执行
                    </Button>
                    <Button>查看详情</Button>
                </ButtonGroup>
            </PanelField>
        </SeaTableRow>
    );
};
