import { wrapper } from '@sa-core/common';
import { ReflectObjBase } from '@sa-core/mod-type';

interface CapturedPackage {
    type: 'RemoveListener' | 'AddListener' | 'Received' | 'Send';
    time: string;
    cmd: number;
    label: string;
    data?: Array<number | egret.ByteArray> | DataView;
    callbacks: number;
}

type Status = 'pending' | 'capturing';

class applyBm extends ReflectObjBase implements ModClass {
    filterList: number[] = [
        1002, // SYSTEM_TIME
        2001, // ENTER_MAP
        2002, // LEAVE_MAP
        2441, // LOAD_PERCENT
        9019, // NONO_FOLLOW_OR_HOOM
        9274, //PET_GET_LEVEL_UP_EXP
        41228, // SYSTEM_TIME_CHECK
    ];
    listenerList = new Map<number, Function[]>();
    captureList: CapturedPackage[] = [];
    status: Status = 'pending';

    constructor() {
        super();
        const getLabel = SocketEncryptImpl.getCmdLabel.bind(SocketEncryptImpl);
        const timeFormatter = Intl.DateTimeFormat('zh-cn', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });

        SocketConnection.mainSocket.addCmdListener = wrapper(
            SocketConnection.mainSocket.addCmdListener,
            undefined,
            (cmd, callback) => {
                if (this.filterList.includes(cmd)) return;
                if (this.listenerList.has(cmd) === false) {
                    this.listenerList.set(cmd, []);
                }
                const arr = this.listenerList.get(cmd)!;
                arr.push(callback);
                this.captureList.push({
                    cmd,
                    label: getLabel(cmd),
                    time: timeFormatter.format(new Date()),
                    type: 'AddListener',
                    callbacks: arr.length,
                });
            }
        );

        SocketConnection.mainSocket.removeCmdListener = wrapper(
            SocketConnection.mainSocket.removeCmdListener,
            undefined,
            (cmd, callback) => {
                if (this.filterList.includes(cmd)) return;
                if (this.listenerList.has(cmd) === true && this.listenerList.get(cmd)!.includes(callback)) {
                    const arr = this.listenerList.get(cmd)!;
                    arr.splice(arr.indexOf(callback), 1);
                    this.captureList.push({
                        cmd,
                        label: getLabel(cmd),
                        time: timeFormatter.format(new Date()),
                        type: 'RemoveListener',
                        callbacks: arr.length,
                    });
                }
            }
        );

        SocketConnection.mainSocket.dispatchCmd = wrapper(
            SocketConnection.mainSocket.dispatchCmd,
            undefined,
            (cmd, head, buf) => {
                if (this.status === 'pending' || this.filterList.includes(cmd)) return;
                const arr = this.listenerList.get(cmd);
                this.captureList.push({
                    cmd,
                    data: buf.dataView,
                    label: getLabel(cmd),
                    time: timeFormatter.format(new Date()),
                    type: 'Received',
                    callbacks: arr?.length ?? 0,
                });
                console.log(this.captureList.at(-1));
            }
        );

        SocketConnection.mainSocket.send = wrapper(SocketConnection.mainSocket.send, undefined, (cmd, data) => {
            if (this.status === 'pending' || this.filterList.includes(cmd)) return;
            const arr = this.listenerList.get(cmd);
            this.captureList.push({
                cmd,
                data: data,
                label: getLabel(cmd),
                time: timeFormatter.format(new Date()),
                type: 'Send',
                callbacks: arr?.length ?? 0,
            });
            console.log(this.captureList.at(-1));
        });
    }

    init() {}

    start() {
        this.status = 'capturing';
    }

    stop() {
        this.status = 'capturing';
    }

    clear() {
        this.captureList.splice(0);
    }

    dump() {
        console.table(this.captureList);
    }

    dumpListener() {
        for (const [k, v] of this.listenerList.entries()) {
            if (v.length > 0) {
                console.log(`${k} : ${SocketEncryptImpl.getCmdLabel(k)}`);
                console.table(v);
            }
        }
    }

    meta = { description: '' };
}

export default {
    mod: applyBm,
};
