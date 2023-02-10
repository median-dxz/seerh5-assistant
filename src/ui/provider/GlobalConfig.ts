const keys = {
    PetBagScheme: 'PetBagScheme',
    LocalSkin: 'LocalSkin',
    CommandShortcut: 'CommandShortcut',
    DiedSwitchLink: 'DiedSwitchLink',
    SkillNameMatch: 'SkillNameMatch',
} as const;

type SAStorageKey = AttrConst<typeof keys>;

const serialize = JSON.stringify;
const deserialize = JSON.parse;

export function setObject(key: SAStorageKey, o: any) {
    window.localStorage.setItem(key, serialize(o));
}
export function getObject(key: SAStorageKey) {
    const item = window.localStorage.getItem(key);
    if (!item) return undefined;
    return deserialize(item);
}

export function clear(key: SAStorageKey) {
    window.localStorage.removeItem(key);
}
