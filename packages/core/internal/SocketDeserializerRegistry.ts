import { getLogger } from '../common/logger.js';
import { IS_DEV, type ValueOf } from '../common/utils.js';
import type { HookPointDataMap, SocketResponseMap as ResponseMap } from '../constant/TypeMaps.js';

type BufferData = HookPointDataMap['socket:receive']['buffer'];

type DataDeserializer<T> = (data: BufferData) => T;

const DeserializerMap = new Map<keyof ResponseMap, DataDeserializer<ValueOf<ResponseMap>>>();

const IDENTITY = (data: BufferData) => data;

const logger = getLogger('SocketDeserializerRegistry');

export const SocketDeserializerRegistry = {
    register<TCmd extends keyof ResponseMap, TData extends ResponseMap[TCmd]>(
        cmd: TCmd,
        deserializer: DataDeserializer<TData>
    ) {
        if (DeserializerMap.has(cmd)) {
            IS_DEV &&
                console.warn(
                    `[error]: 用于 ${cmd} 的反序列化器已经被注册, 这将导致之前的反序列化器被覆盖, 请检查可能的冲突问题`
                );
            logger.warn(`register: ${cmd} 已经被注册`);
        }
        DeserializerMap.set(cmd, deserializer);
        logger.info(`register: ${cmd}`);
    },

    unregister<TCmd extends number>(cmd: TCmd) {
        DeserializerMap.delete(cmd);
        logger.info(`unregister: ${cmd}`);
    },

    getDeserializer<TCmd extends number>(cmd: TCmd): DataDeserializer<ResponseMap[TCmd]> {
        if (DeserializerMap.has(cmd)) {
            return DeserializerMap.get(cmd)!;
        } else {
            return IDENTITY;
        }
    }
};
