var h = Object.defineProperty;
var i = (a, e, t) => e in a ? h(a, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : a[e] = t;
var n = (a, e, t) => (i(a, typeof e != "symbol" ? e + "" : e, t), t);
class c {
  constructor() {
    n(this, "meta", {
      id: "teamTechCenter",
      author: "median",
      type: "module",
      description: "精灵科技中心模块注入, 提供一键强化到满级功能"
    });
    n(this, "moduleName", "team");
  }
  load() {
    team.TeamTech.prototype.onClickEnhance = async function() {
      const e = this.list_attr.selectedIndex;
      if (this._petInfo == null) {
        Alarm.show("先选择你要进行强化的精灵哦！");
        return;
      }
      if (this.getMax(e) <= this._petInfo.getTeamTechAdd(e)[0]) {
        BubblerManager.getInstance().showText("已完成该项属性值的战队加成！");
        return;
      }
      if (this.getNeedCost(e) > this._costNum) {
        BubblerManager.getInstance().showText("你的战队贡献值不足！");
        return;
      }
      const t = () => sac.Socket.sendByQueue(CommandID.NEW_TEAM_PET_RISE, [this._petInfo.catchTime, e]).then(() => PetManager.UpdateBagPetInfoAsynce(this._petInfo.catchTime)).then((s) => {
        if (this._petInfo = s, this.updateData(), this.showPetDetail(), this.onTouchAttr(), this.getMax(e) > this._petInfo.getTeamTechAdd(e)[0])
          return t();
        BubblerManager.getInstance().showText("一键强化成功！");
      });
      await t();
    };
  }
}
export {
  c as default
};
//# sourceMappingURL=TeamTechCenter.js.map
