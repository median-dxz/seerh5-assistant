import { PanelField, PanelTable, useRowData, type PanelColumns } from '@/components/PanelTable';
import { Button, Toolbar } from '@mui/material';

import { SeaTableRow } from '@/components/styled/TableRow';
import { produce } from 'immer';
import * as React from 'react';
import type { AnyFunction, HookDataMap } from 'sea-core';
import { SEAEventSource, Subscription, restoreHookedFn } from 'sea-core';

interface CapturedPackage {
    type: 'RemoveListener' | 'AddListener' | 'Received' | 'Send';
    time: number;
    cmd: number;
    label: string;
    data?: Array<number | DataView> | DataView | AnyFunction;
    index: number; // 用作生成React.key
}

type State = 'pending' | 'capturing';

const timeFormat = Intl.DateTimeFormat('zh-cn', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
});

const listLimit = 300;

const capturedPkgFactory = (
    update: React.Dispatch<React.SetStateAction<CapturedPackage[]>>,
    originalPack: Pick<CapturedPackage, 'cmd' | 'data' | 'type'>
) => {
    update(
        produce((draft) => {
            draft.push({
                ...originalPack,
                time: Date.now(),
                label: SocketEncryptImpl.getCmdLabel(originalPack.cmd),
                index: draft.length,
            });
            draft.splice(0, draft.length - listLimit);
        })
    );
};

// SocketConnection.mainSocket.filterCMDLog(1001, 1002, 1016, 2001, 2002, 2441, 9019, 41228, 42387);
const CmdMask = [
    1002, // SYSTEM_TIME
    2001, // ENTER_MAP
    2002, // LEAVE_MAP
    2004, // MAP_OGRE_LIST
    2441, // LOAD_PERCENT
    9019, // NONO_FOLLOW_OR_HOOM
    9274, //PET_GET_LEVEL_UP_EXP
    41228, // SYSTEM_TIME_CHECK
];

// clear() {
//     this.captureList.splice(0);
// }

// dump() {
//     console.table(this.captureList);
// }

// dumpListener() {
//     for (const [k, v] of this.listenerList.entries()) {
//         if (v.length > 0) {
//             console.log(`${k} : ${SocketEncryptImpl.getCmdLabel(k)}`);
//             console.table(v);
//         }
//     }
// }

export function PackageCapture() {
    const [state, setState] = React.useState<State>('pending');
    const [capture, setCapture] = React.useState<CapturedPackage[]>([]);

    // const getLabel = SocketEncryptImpl.getCmdLabel;

    React.useEffect(() => {
        // wrapperFactory('addCmdListener', (cmd, callback) => {
        //     if (state !== 'capturing' || CmdMask.includes(cmd)) return;
        //     capturedPkgFactory(setCapture, { cmd, type: 'AddListener', data: callback });
        // });

        // wrapperFactory('removeCmdListener', (cmd, callback) => {
        //     if (state !== 'capturing' || CmdMask.includes(cmd)) return;
        //     capturedPkgFactory(setCapture, { cmd, type: 'RemoveListener', data: callback });
        // });

        const onReceive = ({ buffer, cmd }: HookDataMap['socket:receive']) => {
            if (state !== 'capturing' || CmdMask.includes(cmd)) return;
            capturedPkgFactory(setCapture, { cmd, data: buffer?.dataView, type: 'Received' });
        };

        const onSend = ({ cmd, data }: HookDataMap['socket:send']) => {
            if (state !== 'capturing' || CmdMask.includes(cmd)) return;
            capturedPkgFactory(setCapture, {
                cmd,
                data: data.flat().map((v) => (v instanceof egret.ByteArray ? v.dataView : v)),
                type: 'Send',
            });
        };

        const $socket = {
            send: SEAEventSource.hook('socket:send'),
            receive: SEAEventSource.hook('socket:receive'),
        };

        const subscription = new Subscription();

        subscription.on($socket.send, onSend);
        subscription.on($socket.receive, onReceive);

        return () => {
            restoreHookedFn(SocketConnection.mainSocket, 'addCmdListener');
            restoreHookedFn(SocketConnection.mainSocket, 'removeCmdListener');
            subscription.dispose();
        };
    }, [state, capture]);

    const cols: PanelColumns = React.useMemo(
        () => [
            { field: 'time', columnName: '时间' },
            { field: 'type', columnName: '类型' },
            { field: 'cmd', columnName: '命令ID' },
            {
                field: 'label',
                columnName: '命令名',
                sx: { fontFamily: 'Open Sans, MFShangHei', fontSize: '0.9rem', p: 0 },
            },
            { field: 'data', columnName: '操作' },
        ],
        []
    );
    return (
        <>
            <Toolbar>
                <Button
                    onClick={() => {
                        if (state === 'capturing') {
                            setState('pending');
                        } else if (state === 'pending') {
                            setState('capturing');
                        }
                    }}
                >
                    {state === 'capturing' ? '停止' : state === 'pending' ? '监听' : ''}
                </Button>
                <Button>清除</Button>
                <Button
                    onClick={() => {
                        setCapture([]);
                    }}
                >
                    全部清除
                </Button>
                <Button>筛选器</Button>
                <Button
                    onClick={() => {
                        console.table(capture);
                    }}
                >
                    一键dump
                </Button>
            </Toolbar>

            <PanelTable data={capture} columns={cols} rowElement={<PanelRow />} />
        </>
    );
}

const PanelRow = React.memo(function PanelRow() {
    const pkg = useRowData<CapturedPackage>();
    return (
        <SeaTableRow>
            <PanelField field="time">{timeFormat.format(pkg.time)}</PanelField>
            <PanelField field="type">{pkg.type}</PanelField>
            <PanelField field="cmd">{pkg.cmd}</PanelField>
            <PanelField field="label">{pkg.label}</PanelField>
            <PanelField field="data">
                <Button
                    onClick={() => {
                        console.log(pkg);
                    }}
                >
                    dump
                </Button>
                <Button
                    onClick={() => {
                        if (pkg.type === 'Send') {
                            const data = pkg.data as Array<number | DataView>;
                            SocketConnection.mainSocket.send(
                                pkg.cmd,
                                data.map((v) => (typeof v === 'object' ? new egret.ByteArray(v.buffer) : v))
                            );
                        }
                    }}
                >
                    重放
                </Button>
            </PanelField>
        </SeaTableRow>
    );
});
