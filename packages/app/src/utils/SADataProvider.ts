interface SADataScheme {
    [key: string]: unknown;

    pets: Record<string, number>;

    mods: {
        [modId: string]: Record<string, unknown>;
    };
}

export const dataProvider = {
    data: {} as SADataScheme,

    async init() {
        this.data = await fetch('/api/data').then((r) => r.json());
    },

    get<TKey extends keyof SADataScheme>(key: TKey): SADataScheme[TKey] {
        return this.data[key];
    },

    update(key: string, value: unknown) {
        this.data[key] = value;
        fetch('/api/data', {
            method: 'POST',
            body: JSON.stringify({ key, value }),
            headers: {
                'Content-Type': 'application/json',
            },
        });
    },
};

// 配置注入，如果不存在则创建并传入默认项
export const injectModConfig = (id: string, defaultConfig: object) => {
    if (!dataProvider.data.mods?.[id]) {
        Object.assign(dataProvider.data.mods, { [id]: defaultConfig });
        fetch(`/api/data?mod=${id}`, {
            method: 'POST',
            body: JSON.stringify(defaultConfig),
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    return dataProvider.data.mods[id];
};
