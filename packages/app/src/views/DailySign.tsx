import { PanelColumnRender, PanelColumns, PanelTable } from '@sa-app/components/PanelTable';
import React from 'react';

import { Button, ButtonGroup, CircularProgress } from '@mui/material';
import { ModStore } from '@sa-app/ModManager';
import { BaseMod, SAModType, SignModExport } from '@sa-app/ModManager/type';

import { delay } from 'sa-core';
import useSWR from 'swr';

export function DailySign() {
    const data = Array.from(ModStore)
        .filter(([_, mod]) => {
            return mod.meta.type === SAModType.SIGN_MOD;
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
                field: 'author',
                columnName: '作者',
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

    const render: PanelColumnRender<BaseMod> = React.useCallback((ins) => {
        const exports = ins.export as Record<string, SignModExport>;
        const { meta, namespace } = ins;
        return {
            name: meta.id,
            description: meta.description,
            author: meta.author,
            state: <SignState namespace={namespace} checkers={exports} />,
            execute: (
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
            ),
        };
    }, []);

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
            <PanelTable data={data} columns={columns} columnRender={render} toRowKey={(mod) => mod.namespace} />
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
