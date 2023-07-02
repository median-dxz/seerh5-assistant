var h = Object.defineProperty;
var c = (r, t, e) => t in r ? h(r, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : r[t] = e;
var d = (r, t, e) => (c(r, typeof t != "symbol" ? t + "" : t, e), e);
const l = "LocalSkin", a = sac.createLocalStorageProxy(
  l,
  { changed: /* @__PURE__ */ new Map(), original: /* @__PURE__ */ new Map() },
  (r) => {
    const t = {
      changed: Array.from(r.changed.entries()),
      original: Array.from(r.original.entries())
    };
    return JSON.stringify(t);
  },
  (r) => {
    const { changed: t, original: e } = JSON.parse(r);
    return { changed: new Map(t), original: new Map(e) };
  }
);
class g {
  constructor() {
    d(this, "meta", {
      id: "LocalPetSkin",
      scope: "median",
      type: "base",
      description: "本地全皮肤解锁"
    });
  }
  activate() {
    Object.defineProperty(FighterUserInfo.prototype, "petInfoArr", {
      set: function(t) {
        const e = (i) => this.id == MainManager.actorID ? i.skinId : i._skinId ?? 0;
        this._petInfoArr = t, this._petIDArr = [], this._petCatchArr = [], this._petSkillIDArr = [], this._aliveNum = 0;
        for (const i of this._petInfoArr) {
          const n = PetFightSkinSkillReplaceXMLInfo.getSkills(e(i), i.id);
          let s = i.id;
          s = PetIdTransform.getPetId(s, i.catchTime, !0), e(i) != 0 && (s = PetSkinXMLInfo.getSkinPetId(e(i), i.id)), this._petIDArr.push(s), this._petCatchArr.push(i.catchTime);
          for (const o of i.skillArray)
            o instanceof PetSkillInfo ? this.add2List(this._petSkillIDArr, o.id, n) : this.add2List(this._petSkillIDArr, o, n);
          i.hideSKill && this.add2List(this._petSkillIDArr, i.hideSKill.id, n), i.hp > 0 && this._aliveNum++;
        }
      }
    }), Object.defineProperty(FightPetInfo.prototype, "skinId", {
      get: function() {
        return a.changed.has(this._petID) && this.userID == MainManager.actorID ? a.changed.get(this._petID).skinId : this._skinId ?? 0;
      }
    }), Object.defineProperty(PetInfo.prototype, "skinId", {
      get: function() {
        return a.changed.has(this.id) ? a.changed.get(this.id).skinId : this._skinId ?? 0;
      }
    }), PetManager.equipSkin = async (t, e = 0, i = sac.NOOP) => {
      const n = PetManager.getPetInfo(t);
      this.logger("new skin id:", e, "previous skin id:", n.skinId), e === 0 || PetSkinController.instance.haveSkin(e) ? (a.original.get(n.id) !== e ? await sac.Socket.sendByQueue(47310, [t, e]) : a.use(({ original: s }) => {
        s.delete(n.id);
      }), a.use(({ changed: s }) => {
        s.delete(n.id);
      })) : a.use(({ original: s, changed: o }) => {
        s.has(n.id) || s.set(n.id, n.skinId), o.set(n.id, {
          skinId: e,
          petSkinId: PetSkinXMLInfo.getSkinPetId(e, n.id)
        });
      }), PetManager.dispatchEvent(new PetEvent(PetEvent.EQUIP_SKIN, t, e)), i();
    };
  }
}
export {
  g as default
};
//# sourceMappingURL=LocalPetSkin.js.map
