import { filter, map, zip, type Observable } from 'rxjs';
import { type SocketResponseMap } from '../../constant/index.js';
import { SocketDeserializerRegistry } from '../../internal/SocketDeserializerRegistry.js';
import { SEAEventSource } from '../EventSource.js';
import { $hook } from './fromHook.js';

type SocketEvent = 'send' | 'receive';
type CMD = keyof SocketResponseMap;

const $socket = {
    send(cmd: number) {
        return $hook('socket:send').pipe(
            filter((req) => req.cmd === cmd),
            map(({ data }) => {
                data = data.flat();
                const bytes = new egret.ByteArray();
                data.forEach((v) => {
                    if (v instanceof egret.ByteArray) {
                        bytes.writeBytes(v);
                    } else {
                        bytes.writeUnsignedInt(v);
                    }
                });
                bytes.position = 0;
                return bytes;
            })
        );
    },
    receive<TCmd extends CMD>(cmd: TCmd) {
        return $hook('socket:receive').pipe(
            filter((req) => req.cmd === cmd),
            map(({ buffer }) => buffer),
            map(SocketDeserializerRegistry.getDeserializer(cmd))
        );
    },
    zip<TCmd extends CMD>(cmd: TCmd) {
        return zip(this.send(cmd), this.receive(cmd));
    }
};

type SendData = ReturnType<typeof $socket.send> extends Observable<infer T> ? T : never;
type ReceiveData<TCmd extends CMD> = ReturnType<typeof $socket.receive<TCmd>> extends Observable<infer T> ? T : never;

export function fromSocket<TCmd extends CMD>(cmd: TCmd): SEAEventSource<[SendData, ReceiveData<TCmd>]>;
export function fromSocket(cmd: CMD, event: 'send'): SEAEventSource<SendData>;
export function fromSocket<TCmd extends CMD>(cmd: TCmd, event: 'receive'): SEAEventSource<ReceiveData<TCmd>>;

export function fromSocket(cmd: number, event?: SocketEvent) {
    switch (event) {
        case 'send':
            return new SEAEventSource($socket.send(cmd));
        case 'receive':
            return new SEAEventSource($socket.receive(cmd));
        default:
            return new SEAEventSource($socket.zip(cmd));
    }
}
