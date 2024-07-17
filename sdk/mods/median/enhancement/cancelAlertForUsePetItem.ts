import { hookPrototype } from '@sea/core';

declare const Alert: {
    show: (text: string, cb: () => void) => void;
};

/** cancel alert before use item for pet */
export function cancelAlertForUsePetItem() {
    hookPrototype(ItemUseManager, 'useItem', function (_, t, e) {
        if (!t) {
            BubblerManager.getInstance().showText('使用物品前，请先选择一只精灵');
            return;
        }
        e = Number(e);

        const use = () => {
            const r = ItemXMLInfo.getName(e);
            this.$usePetItem({ petInfo: t, itemId: ~~e, itemName: r }, e);
        };

        if (e >= 0) {
            if (e === 300066) {
                Alert.show(`你确定要给 ${t.name} 使用通用刻印激活水晶吗`, use);
            } else {
                use();
            }
        }
    });
}
