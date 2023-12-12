import type { ValueOf } from '../common/utils.js';
import type { HookDataMap, SocketResponseMap as ResponseMap } from '../constant/types.js';

type BufferData = HookDataMap['socket:receive']['buffer'];

type DataBuilder<T> = (data: BufferData) => T;

const BuilderMap = new Map<keyof ResponseMap, DataBuilder<ValueOf<ResponseMap>>>();

const IDENTITY = (data: BufferData) => data;

export const SocketBuilderRegistry = {
    register<TCmd extends keyof ResponseMap, TData extends ResponseMap[TCmd]>(cmd: TCmd, builder: DataBuilder<TData>) {
        BuilderMap.set(cmd, builder);
    },

    unregister<TCmd extends number>(cmd: TCmd) {
        BuilderMap.delete(cmd);
    },

    getBuilder<TCmd extends number>(cmd: TCmd): DataBuilder<ResponseMap[TCmd]> {
        if (BuilderMap.has(cmd)) {
            return BuilderMap.get(cmd)!;
        } else {
            return IDENTITY;
        }
    },
};
