import { packetCapture, type PacketEvent } from '@/features/packetCapture';
import { useAppDispatch } from '@/shared';
import { Button, Toolbar } from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';

// dumpListener() {
//     for (const [k, v] of this.listenerList.entries()) {
//         if (v.length > 0) {
//             console.log(`${k} : ${socketEncryptImpl.getCmdLabel(k)}`);
//             console.table(v);
//         }
//     }
// }

const columns: Array<GridColDef<PacketEvent>> = [
    { field: 'time', headerName: '时间' },
    { field: 'type', headerName: '类型' },
    { field: 'cmd', headerName: '命令ID' },
    { field: 'label', headerName: '命令名' },
    { field: 'data', headerName: '操作' }
];

export function PackageCapture() {
    const dispatch = useAppDispatch();
    const { running, packets } = packetCapture.useSelectProps('running', 'packets');

    return (
        <>
            <Toolbar>
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
                <Button>清除</Button>
                <Button
                    onClick={() => {
                        dispatch(packetCapture.clear());
                    }}
                >
                    全部清除
                </Button>
                <Button>筛选器</Button>
                <Button
                    onClick={() => {
                        console.table(packets);
                    }}
                >
                    一键dump
                </Button>
            </Toolbar>

            <DataGrid columns={columns} rowBufferPx={300} rows={packets.map((d) => ({ id: d.index, ...d }))} />
        </>
    );
}

// const PanelRow = memo(function PanelRow({ pkg }: { pkg: PacketEvent }) {
//     return (
//         <SeaTableRow>
//             <PanelField field="time">{dayjs(pkg.time).format('HH:mm:ss')}</PanelField>
//             <PanelField field="type">{pkg.type}</PanelField>
//             <PanelField field="cmd">{pkg.cmd}</PanelField>
//             <PanelField field="label">{pkg.label}</PanelField>
//             <PanelField field="data">
//                 <Button
//                     onClick={() => {
//                         console.log(pkg);
//                     }}
//                 >
//                     dump
//                 </Button>
//                 {pkg.type === 'Send' && (
//                     <Button
//                         onClick={() => {
//                             const data = pkg.buffer;
//                             if (typeof data === 'undefined') {
//                                 SocketConnection.mainSocket.send(pkg.cmd, []);
//                             } else if (Array.isArray(data)) {
//                                 SocketConnection.mainSocket.send(
//                                     pkg.cmd,
//                                     data.map((d) => (d instanceof Uint8Array ? new egret.ByteArray(d) : d))
//                                 );
//                             } else {
//                                 SocketConnection.mainSocket.send(pkg.cmd, [new egret.ByteArray(data)]);
//                             }
//                         }}
//                     >
//                         重放
//                     </Button>
//                 )}
//             </PanelField>
//         </SeaTableRow>
//     );
// });
