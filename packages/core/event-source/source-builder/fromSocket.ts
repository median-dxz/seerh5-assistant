import { filter, map, zip, type Observable } from 'rxjs';
import { type SocketResponseMap } from '../../constant/index.js';
import { SEAEventSource } from '../EventSource.js';
import { SocketBuilderRegistry } from '../SocketBuilderRegistry.js';
import { $hook } from './fromHook.js';

type SocketEvent = 'send' | 'receive' | undefined;
type CMD = keyof SocketResponseMap;

const $fromSocket = {
    send<TCmd extends CMD>(cmd: TCmd) {
        return $hook('socket:send').pipe(
            filter(({ cmd: _cmd }) => _cmd === cmd),
            map(({ data }) => data)
        );
    },
    receive<TCmd extends CMD>(cmd: TCmd) {
        return $hook('socket:receive').pipe(
            filter(({ cmd: _cmd }) => _cmd === cmd),
            map(({ buffer }) => buffer),
            map(SocketBuilderRegistry.getBuilder(cmd))
        );
    },
};

export function $socket<TCmd extends CMD>(
    cmd: TCmd,
    event?: SocketEvent
):
    | Observable<seerh5.SocketRequestData>
    | Observable<SocketResponseMap[TCmd]>
    | Observable<[seerh5.SocketRequestData, SocketResponseMap[TCmd]]>;
export function $socket(cmd: CMD, event: 'send'): Observable<seerh5.SocketRequestData>;
export function $socket<TCmd extends CMD>(cmd: TCmd, event: 'receive'): Observable<SocketResponseMap[TCmd]>;
export function $socket<TCmd extends CMD>(
    cmd: TCmd,
    event?: undefined
): Observable<[seerh5.SocketRequestData, SocketResponseMap[TCmd]]>;

export function $socket<TCmd extends CMD>(cmd: TCmd, event?: SocketEvent) {
    if (event === undefined) {
        return zip($fromSocket.send(cmd), $fromSocket.receive(cmd));
    }

    if (event === 'send') return $fromSocket.send(cmd);
    if (event === 'receive') return $fromSocket.receive(cmd);

    throw `Invalid type ${event as string}, type could only be 'send' or 'receive'`;
}

type InferFromSocketReturnType<TCmd extends CMD, Event extends SocketEvent | undefined> = Event extends 'send'
    ? seerh5.SocketRequestData
    : Event extends 'receive'
    ? SocketResponseMap[TCmd]
    : Event extends undefined
    ? [seerh5.SocketRequestData, SocketResponseMap[TCmd]]
    : never;

export function fromSocket<TCmd extends CMD, TEvent extends SocketEvent = undefined>(cmd: TCmd, event?: TEvent) {
    return new SEAEventSource($socket(cmd, event) as Observable<InferFromSocketReturnType<TCmd, TEvent>>);
}
