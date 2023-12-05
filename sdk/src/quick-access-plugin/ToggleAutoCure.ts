import { Engine } from 'sea-core';
import Icon from './local_hospital.svg?raw';

export default async function ToggleAutoCure(createContext: SEAL.createModContext) {
    const { meta } = await createContext({
        meta: {
            id: 'LocalPetSkin',
            scope: 'median',
            core: '0.7.4',
        },
    });

    let autoCure = await Engine.autoCureState();

    const toggleAutoCure: SEAL.Command = {
        name: 'ToggleAutoCure',
        icon: Icon,
        description: () => `自动治疗: ${autoCure ? '开' : '关'}`,
        async handler() {
            await Engine.toggleAutoCure(!autoCure);
            autoCure = await Engine.autoCureState();
        },
    };

    return {
        meta,
        exports: {
            command: [toggleAutoCure],
        },
    } satisfies SEAL.ModExport;
}
