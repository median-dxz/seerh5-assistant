import type { ValueOf } from '../common/utils.js';
import type { HookDataMap, SocketResponseMap as ResponseMap } from '../constant/types.js';

type BufferData = HookDataMap['socket:receive']['buffer'];

type DataDeserializer<T> = (data: BufferData) => T;

const DeserializerMap = new Map<keyof ResponseMap, DataDeserializer<ValueOf<ResponseMap>>>();

const IDENTITY = (data: BufferData) => data;

export const SocketDeserializerRegistry = {
    register<TCmd extends keyof ResponseMap, TData extends ResponseMap[TCmd]>(cmd: TCmd, deserializer: DataDeserializer<TData>) {
        DeserializerMap.set(cmd, deserializer);
    },

    unregister<TCmd extends number>(cmd: TCmd) {
        DeserializerMap.delete(cmd);
    },

    getDeserializer<TCmd extends number>(cmd: TCmd): DataDeserializer<ResponseMap[TCmd]> {
        if (DeserializerMap.has(cmd)) {
            return DeserializerMap.get(cmd)!;
        } else {
            return IDENTITY;
        }
    },
};
