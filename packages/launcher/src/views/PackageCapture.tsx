import FileUpload from '@mui/icons-material/FileUploadRounded';
import Replay from '@mui/icons-material/ReplayRounded';

import { Row } from '@/components/Row';
import { packetCapture, type PacketEvent } from '@/features/packetCapture';
import { useAppDispatch } from '@/shared';
import { alpha, Box, Button, Tooltip } from '@mui/material';
import {
    DataGrid,
    GridActionsCellItem,
    gridFilteredSortedRowEntriesSelector,
    useGridApiRef,
    type GridActionsCellItemProps,
    type GridColDef,
    type GridRowParams
} from '@mui/x-data-grid';
import dayjs from 'dayjs';
import { type ReactElement } from 'react';

const columns: Array<GridColDef<PacketEvent>> = [
    {
        field: 'time',
        headerName: '时间',
        type: 'dateTime',
        minWidth: 100,
        valueGetter: (value: number) => new Date(value),
        valueFormatter: (value: Date) => dayjs(value).format('HH:mm:ss')
    },
    {
        field: 'type',
        type: 'singleSelect',
        headerName: '类型',
        minWidth: 100,
        valueOptions: ['RemoveListener', 'AddListener', 'Received', 'Send']
    },
    {
        field: 'cmd',
        headerName: '命令ID',
        // 存在性能问题
        // type: 'singleSelect',
        // valueOptions: () => Object.values(CommandID),
        minWidth: 100,
        align: 'center',
        headerAlign: 'center'
    },
    {
        field: 'label',
        headerName: '命令名',
        // type: 'singleSelect',
        // valueOptions: () => Object.keys(CommandID),
        width: 200,
        minWidth: 200,
        align: 'center',
        headerAlign: 'center'
    },
    {
        field: 'value',
        headerName: '值',
        valueGetter: (value, row) => {
            switch (row.type) {
                case 'Send':
                    if (row.buffer) {
                        const r: Array<string | number> = [];
                        row.buffer.forEach((v) => {
                            if (typeof v === 'number') {
                                r.push(v);
                            } else if (v instanceof Uint8Array) {
                                r.push(`Buffer(${v.length})`);
                            }
                        });
                        return r;
                    } else {
                        return null;
                    }
                case 'Received':
                    if (row.data instanceof Uint8Array) {
                        return `Buffer(${row.data.length})`;
                    } else {
                        return JSON.stringify(row.data ?? null);
                    }
            }
        }
    },
    {
        field: 'operation',
        headerName: '操作',
        type: 'actions',
        width: 160,
        minWidth: 160,
        resizable: false,
        getActions: ({ row: pkg }: GridRowParams<PacketEvent>) =>
            [
                <Tooltip key="dump" title="导出" placement="top">
                    <GridActionsCellItem
                        label="Dump"
                        icon={<FileUpload />}
                        onClick={() => {
                            console.log(pkg);
                        }}
                    />
                </Tooltip>,
                pkg.type === 'Send' && (
                    <Tooltip key="replay" title="重放" placement="top">
                        <GridActionsCellItem
                            label="Replay"
                            icon={<Replay />}
                            onClick={() => {
                                const data = pkg.buffer;
                                if (typeof data === 'undefined') {
                                    SocketConnection.mainSocket.send(pkg.cmd, []);
                                } else if (Array.isArray(data)) {
                                    SocketConnection.mainSocket.send(
                                        pkg.cmd,
                                        data.map((d) => (d instanceof Uint8Array ? new egret.ByteArray(d) : d))
                                    );
                                } else {
                                    SocketConnection.mainSocket.send(pkg.cmd, [new egret.ByteArray(data)]);
                                }
                            }}
                        />
                    </Tooltip>
                )
            ].filter(Boolean) as Array<ReactElement<GridActionsCellItemProps>>
    }
];

export function PackageCapture() {
    const apiRef = useGridApiRef();
    const dispatch = useAppDispatch();
    const { running, packets } = packetCapture.useSelectProps('running', 'packets');

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Row sx={{ mb: 2 }} spacing={2}>
                <Button
                    onClick={() => {
                        if (running) {
                            dispatch(packetCapture.stop());
                        } else {
                            dispatch(packetCapture.start());
                        }
                    }}
                >
                    {running ? '停止' : '监听'}
                </Button>
                <Button
                    onClick={() => {
                        dispatch(packetCapture.clear());
                    }}
                >
                    全部清除
                </Button>
                <Button
                    onClick={() => {
                        void apiRef.current?.autosizeColumns({ columns: ['value'], expand: true });
                    }}
                >
                    扩展数据列
                </Button>
                <Button
                    onClick={() => {
                        const entries = gridFilteredSortedRowEntriesSelector(apiRef).map((entry) => entry.model);
                        entries.forEach((entry) => {
                            console.log(entry);
                        });
                    }}
                >
                    一键dump
                </Button>
            </Row>
            <DataGrid
                apiRef={apiRef}
                autosizeOnMount
                sx={{
                    '& .MuiDataGrid-row--borderBottom[role=row]': {
                        backgroundColor: 'unset'
                    },
                    '& .MuiDataGrid-footerContainer': {
                        minHeight: '56px'
                    },
                    '& .MuiDataGrid-menu.MuiPaper-root': {
                        backgroundColor: ({ palette }) => alpha(palette.secondary.main, 0.88),
                        backdropFilter: 'blur(8px)'
                    },
                    '& .MuiDataGrid-overlay': {
                        background: 'none',
                        border: 'none'
                    }
                }}
                columns={columns}
                rowBufferPx={300}
                rows={packets.map((d) => ({ id: d.index, ...d }))}
            />
        </Box>
    );
}
