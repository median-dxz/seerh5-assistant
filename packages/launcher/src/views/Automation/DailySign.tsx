import { PanelField, PanelTable, useRowData, type PanelColumns } from '@/components/PanelTable';
import React from 'react';

import { Button, ButtonGroup, CircularProgress } from '@mui/material';

import { SeaTableRow } from '@/components/styled/TableRow';
import { useModStore } from '@/context/useModStore';
import type { SignInstance } from '@/service/store/sign';
import { delay } from 'sea-core';
import useSWR from 'swr';

export function DailySign() {
    const { signStore } = useModStore();
    const signs = Array.from(signStore.values());

    const columns: PanelColumns = React.useMemo(
        () => [
            {
                field: 'name',
                columnName: '名称',
            },
            {
                field: 'mod',
                columnName: '模组',
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
        for (const { check, run, name } of signs) {
            console.log(`正在执行${name}`);
            let r = await check();
            while (r--) {
                run();
                await delay(50);
            }
        }
    };

    return (
        <>
            <Button onClick={handleRunAllSign}>一键执行</Button>
            <PanelTable
                data={signs}
                columns={columns}
                rowElement={<PanelRow />}
                toRowKey={(sign) => `${sign.ownerMod}::${sign.name}`}
            />
        </>
    );
}

interface SignStateProps {
    namespace: string;
    checker: SignInstance;
}

const SignState: React.FC<SignStateProps> = ({ namespace, checker }) => {
    const { data: state, isLoading } = useSWR(`ds://mod/sign/check/${namespace}`, async () => {
        return checker.check();
    });

    return isLoading ? <CircularProgress /> : `# ${state}`;
};

const PanelRow = () => {
    const ins = useRowData<SignInstance>();
    const { ownerMod, name, check, run } = ins;

    return (
        <SeaTableRow>
            <PanelField field="name">{name}</PanelField>
            <PanelField field="mod">{ownerMod}</PanelField>
            <PanelField field="state">
                <SignState namespace={`${ownerMod}::${name}`} checker={ins} />
            </PanelField>
            <PanelField field="execute">
                <ButtonGroup>
                    <Button
                        onClick={async () => {
                            console.log(`正在执行${name}`);
                            let r = await check();
                            while (r--) {
                                run();
                                await delay(50);
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
