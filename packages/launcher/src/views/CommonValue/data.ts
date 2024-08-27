import { delay, engine, type AnyFunction } from '@sea/core';

export const idList = [
    1, //赛尔豆
    300065, //特性重组剂Ω
    300066, //通用刻印激活水晶
    1400154, //友谊之星
    1400352, //泰坦之灵
    1707511, //功勋点数
    // 记忆模组
    // 激励模组
    1721558, //界神印记
    1721761, //王者精魄
    1706927, //红宝石
    1706928, //绿宝石
    1717452, //荣耀铸币
    1717451, //圣战奖章
    // 全面药
    // 龙药
    // 不灭珠
    1722506 //先锋旗帜
    // spt奖章
];

declare namespace pveEnterPanel {
    class PveEnterPanel extends BasicMultPanelModule {}
    class PveResourceCollection extends BasicPanel {
        menu: baseMenuComponent.BaseMenuComponent;
        updateView(): void;
    }
}

declare namespace baseMenuComponent {
    class BaseMenuComponent {
        selectedValue: string;
    }
}

const showPveResourcePanel = async (itemValue: string) => {
    await ModuleManager.showModuleByID(18);
    const curModule = engine.inferCurrentModule<pveEnterPanel.PveEnterPanel>();
    const panelName = 'pveEnterPanel.PveResourceCollection';
    curModule.service.openPanel(panelName);
    await delay(1500);
    const curPanel = curModule.panelMap[panelName] as pveEnterPanel.PveResourceCollection;
    curPanel.menu.selectedValue = itemValue;
    curPanel.updateView();
};

export const openModuleList: Record<number, AnyFunction> = {
    1400154: async () => {
        await ModuleManager.showModule('battleFirePanel', ['battleFirePanel'], null, null, AppDoStyle.NULL);
    },
    1707511: async () => {
        await showPveResourcePanel('ITEM');
    }, //功勋点数
    1721558: async () => {
        await showPveResourcePanel('ITEM');
    }, //界神印记
    1721761: async () => {
        await showPveResourcePanel('MARK');
    }, //王者精魄
    1717452: async () => {
        await ModuleManager.showModuleByID(255);
    }, //荣耀铸币
    1717451: async () => {
        await ModuleManager.showModuleByID(255);
    }, //圣战奖章
    1722506: async () => {
        await ModuleManager.showModule('pveSpt');
    } //先锋旗帜
};
