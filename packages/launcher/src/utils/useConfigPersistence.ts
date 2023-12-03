import * as endpoints from '@/service/endpoints';
import { enableMapSet, produce, type Draft } from 'immer';
import useSWR from 'swr';

enableMapSet();

export function useConfigPersistence<T>(key: string, initValue: T) {
    const {
        data,
        isLoading,
        mutate: persistenceMutate,
    } = useSWR(
        key,
        (key: string) =>
            endpoints.getConfig(key).then((v) => {
                return (v as T) ?? initValue;
            }),
        {
            fallbackData: initValue,
        }
    );

    const mutate = (recipe: (draft: Draft<T>) => void) => {
        persistenceMutate(async () => {
            const nextData = produce(data, recipe);
            const r = await endpoints.setConfig(key, nextData);
            if (r.success) {
                return nextData;
            } else {
                throw new Error('更新配置失败');
            }
        });
    };

    return { data, isLoading, mutate };
}

// sub.on(fromSocket(CommandID.NOTE_USE_SKILL, 'receive'), (data) => {
//     const [fi, si] = data;
//     Logger.BattleManager.info(`对局信息更新:
//         先手方:${fi.userId}
//         hp: ${fi.hp.remain} / ${fi.hp.max}
//         造成伤害: ${fi.damage}
//         是否暴击:${fi.isCrit}
//         使用技能: ${SkillXMLInfo.getName(fi.skillId)}
//         ===========
//         后手方:${si.userId}
//         hp: ${si.hp.remain} / ${si.hp.max}
//         造成伤害: ${si.damage}
//         是否暴击:${si.isCrit}
//         使用技能: ${SkillXMLInfo.getName(si.skillId)}`);
// });
