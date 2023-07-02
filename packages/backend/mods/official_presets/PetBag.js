var p = Object.defineProperty;
var u = (n, t, e) => t in n ? p(n, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : n[t] = e;
var a = (n, t, e) => (u(n, typeof t != "symbol" ? t + "" : t, e), e);
class h {
  constructor() {
    a(this, "meta", {
      id: "petBag",
      scope: "median",
      type: "module",
      description: "精灵背包模块注入, 提供UI同步和本地皮肤功能的UI支持"
    });
    a(this, "moduleName", "petBag");
    a(this, "eventBus", new sac.SAEventBus());
  }
  load() {
    sac.hookPrototype(petBag.SkinView, "onChooseSkin", function(t, ...e) {
      var s;
      t.call(this, ...e);
      const i = ((s = this.arrayCollection.getItemAt(this.selectSkinIndex)) == null ? void 0 : s.id) ?? 0;
      i && (this.btnPutOn.visible = i !== this.petInfo.skinId, this.imgHasPutOn.visible = i === this.petInfo.skinId);
    });
  }
  mainPanel(t) {
    const e = t.panelMap["petBag.MainPanel"], i = sac.getImageButtonListener(e.btnIntoStorage);
    sac.hookFn(i, "callback", function(o) {
      e.beginPetInfo = e.arrFirstPet[0].petInfo, o.call(i), e.beginPetInfo = null;
    });
    const s = sac.debounce(() => {
      e.initBagView();
    }, 600), c = () => {
      e.beginPetInfo == null && !petBag.ChangePetPop.changeFlag && s();
    }, g = (o) => {
      const { petInfo: l } = o.data;
      l && this.logger(new sac.Pet(l));
    };
    this.eventBus.socket(CommandID.PET_DEFAULT, c), this.eventBus.socket(CommandID.PET_RELEASE, c), this.eventBus.egret("petBag.MainPanelTouchPetItemEnd", g);
  }
  destroy() {
    this.eventBus.unmount();
  }
}
export {
  h as default
};
//# sourceMappingURL=PetBag.js.map
