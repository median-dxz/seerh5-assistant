import { scope } from '@/median/constants.json';
import { hookPrototype, restoreHookedFn, SEAEventSource, socket, Subscription } from '@sea/core';
import type { SEAModContext, SEAModExport, SEAModMetadata } from '@sea/mod-type';

declare var Alarm: any;

export const metadata = {
    id: 'TeamTechCenter',
    scope,
    description: '精灵科技中心模块注入, 提供一键强化到满级功能',
    version: '1.0.0'
} satisfies SEAModMetadata;

// team.TeamTech
export default async function TeamTechCenter(ctx: SEAModContext<typeof metadata>) {
    const load = () => {
        hookPrototype(team.TeamTech, 'onClickEnhance', async function () {
            const index = this.list_attr.selectedIndex;
            if (null == this._petInfo) {
                Alarm.show('先选择你要进行强化的精灵哦！');
                return;
            }
            if (this.getMax(index) <= this._petInfo.getTeamTechAdd(index)[0]) {
                BubblerManager.getInstance().showText('已完成该项属性值的战队加成！');
                return;
            }
            if (this.getNeedCost(index) > this._costNum) {
                BubblerManager.getInstance().showText('你的战队贡献值不足！');
                return;
            }

            const updateOnce = (): Promise<void> =>
                socket
                    .sendByQueue(CommandID.NEW_TEAM_PET_RISE, [this._petInfo.catchTime, index])
                    .then(() => PetManager.UpdateBagPetInfoAsynce(this._petInfo.catchTime))
                    .then((petInfo) => {
                        this._petInfo = petInfo;
                        this.updateData();
                        this.showPetDetail();
                        this.onTouchAttr();
                        if (this.getMax(index) > this._petInfo.getTeamTechAdd(index)[0]) {
                            return updateOnce();
                        } else {
                            BubblerManager.getInstance().showText('一键强化成功！');
                            return;
                        }
                    });
            await updateOnce();
        });
    };

    const sub = new Subscription();
    let moduleLoaded = false;

    const install = () => {
        sub.on(SEAEventSource.gameModule('team', 'load'), load);
        sub.on(SEAEventSource.gameModule('team', 'load'), () => {
            moduleLoaded = true;
        });
    };

    const uninstall = () => {
        sub.dispose();
        if (moduleLoaded) {
            restoreHookedFn(team.TeamTech.prototype, 'onClickEnhance');
        }
    };

    return {
        install,
        uninstall
    } satisfies SEAModExport;
}
