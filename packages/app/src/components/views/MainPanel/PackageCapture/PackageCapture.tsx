import { Button, TableCell, Toolbar } from '@mui/material';
import * as React from 'react';
import { CmdMask, Hook, SAEventTarget, hook, type SAHookData } from 'seerh5-assistant-core';
import { PanelTableBase, PanelTableBodyRow } from '../base';

interface CapturedPackage {
    type: 'RemoveListener' | 'AddListener' | 'Received' | 'Send';
    time: string;
    cmd: number;
    label: string;
    data?: Array<number | DataView> | DataView | Function;
}

type State = 'pending' | 'capturing';

const timeFormat = Intl.DateTimeFormat('zh-cn', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
});

const capturedPkgFactory = (
    update: React.Dispatch<React.SetStateAction<CapturedPackage[]>>,
    originalPack: Pick<CapturedPackage, 'cmd' | 'data' | 'type'>
) => {
    // 此处有性能问题
    update((c) => [
        ...c,
        {
            ...originalPack,
            time: timeFormat.format(new Date()),
            label: SocketEncryptImpl.getCmdLabel(originalPack.cmd),
        },
    ]);
};

// SocketConnection.mainSocket.filterCMDLog(1001, 1002, 1016, 2001, 2002, 2441, 9019, 41228, 42387);

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

    const getLabel = SocketEncryptImpl.getCmdLabel;

    React.useEffect(() => {
        // wrapperFactory('addCmdListener', (cmd, callback) => {
        //     if (state !== 'capturing' || CmdMask.includes(cmd)) return;
        //     capturedPkgFactory(setCapture, { cmd, type: 'AddListener', data: callback });
        // });

        // wrapperFactory('removeCmdListener', (cmd, callback) => {
        //     if (state !== 'capturing' || CmdMask.includes(cmd)) return;
        //     capturedPkgFactory(setCapture, { cmd, type: 'RemoveListener', data: callback });
        // });

        const onReceive = ({ buffer, cmd }: SAHookData['sa_socket_receive']) => {
            if (state !== 'capturing' || CmdMask.includes(cmd)) return;
            capturedPkgFactory(setCapture, { cmd, data: buffer?.dataView, type: 'Received' });
        };

        const onSend = ({ cmd, data }: SAHookData['sa_socket_send']) => {
            if (state !== 'capturing' || CmdMask.includes(cmd)) return;
            capturedPkgFactory(setCapture, {
                cmd,
                data: data.flat().map((v) => (v instanceof egret.ByteArray ? v.dataView : v)),
                type: 'Send',
            });
        };

        SAEventTarget.on(Hook.Socket.receive, onReceive);
        SAEventTarget.on(Hook.Socket.send, onSend);

        return () => {
            hook(SocketConnection.mainSocket, 'addCmdListener');
            hook(SocketConnection.mainSocket, 'removeCmdListener');
            SAEventTarget.off(Hook.Socket.send, onSend);
            SAEventTarget.off(Hook.Socket.receive, onReceive);
        };
    }, [state, capture]);

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

            <PanelTableBase
                size="small"
                aria-label="capture package table"
                heads={
                    <>
                        <TableCell align="center">时间</TableCell>
                        <TableCell align="center">类型</TableCell>
                        <TableCell align="center">命令ID</TableCell>
                        <TableCell align="center">命令名</TableCell>
                        <TableCell align="center">操作</TableCell>
                    </>
                }
            >
                {capture.map((row, index) => (
                    <PanelTableBodyRow key={index}>
                        <TableCell component="th" scope="row" align="center">
                            {row.time}
                        </TableCell>
                        <TableCell align="center">{row.type}</TableCell>
                        <TableCell align="center">{row.cmd}</TableCell>
                        <TableCell align="center" sx={{ fontFamily: 'Roboto, Helvetica', fontSize: '0.9rem', p: 0 }}>
                            {row.label}
                        </TableCell>
                        <TableCell align="center">
                            <Button
                                onClick={() => {
                                    console.log(row);
                                }}
                            >
                                dump
                            </Button>
                            <Button
                                onClick={() => {
                                    if (row.type === 'Send') {
                                        let data = row.data as Array<number | DataView>;
                                        SocketConnection.mainSocket.send(
                                            row.cmd,
                                            data.map((v) => (typeof v === 'object' ? new egret.ByteArray(v.buffer) : v))
                                        );
                                    }
                                }}
                            >
                                重放
                            </Button>
                        </TableCell>
                    </PanelTableBodyRow>
                ))}
            </PanelTableBase>
        </>
    );
}
