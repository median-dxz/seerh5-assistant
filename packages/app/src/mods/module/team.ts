import { ModuleMod } from '@sa-app/ModManager/mod-type';
import { Socket } from 'sa-core';

class TeamTechCenter extends ModuleMod<team.TeamTech> {
    meta = { id: 'SA::Module::team', description: '精灵科技中心模块注入' };

    moduleName = 'team';

    load() {
        team.TeamTech.prototype.onClickEnhance = async function () {
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
                Socket.sendByQueue(CommandID.NEW_TEAM_PET_RISE, [this._petInfo.catchTime, index])
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
        };
    }
}

export default TeamTechCenter;
