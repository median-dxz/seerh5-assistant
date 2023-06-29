var K = Object.defineProperty;
var tt = (y, s, u) => s in y ? K(y, s, { enumerable: !0, configurable: !0, writable: !0, value: u }) : y[s] = u;
var l = (y, s, u) => (tt(y, typeof s != "symbol" ? s + "" : s, u), u);
const L = {
  刻印抽奖次数: 16577,
  登录时长: 12462,
  已许愿次数: 12231,
  许愿签到天数: 20235,
  许愿签到: 201345
};
class et {
  constructor() {
    l(this, "meta", {
      id: "daily",
      author: "median",
      type: "sign",
      description: "日常签到"
    });
    l(this, "export", {
      刻印抽奖: {
        async check() {
          return +!(await sac.Socket.multiValue(L.刻印抽奖次数))[0];
        },
        run: () => sac.Socket.sendByQueue(46301, [1, 0])
      },
      许愿: {
        async check() {
          let s = (await sac.Socket.multiValue(L.登录时长))[0];
          s = s + Math.floor(SystemTimerManager.sysBJDate.getTime() / 1e3) - MainManager.actorInfo.logintimeThisTime, s = Math.floor(s / 60);
          let u = 0;
          switch (!0) {
            case s >= 120:
              u = 10;
              break;
            case s >= 90:
              u = 7;
              break;
            case s >= 60:
              u = 5;
              break;
            case s >= 30:
              u = 3;
              break;
            case s >= 15:
              u = 2;
              break;
            case s >= 5:
              u = 1;
              break;
            default:
              u = 0;
          }
          return u -= (await sac.Socket.multiValue(L.已许愿次数))[0], u;
        },
        run: () => sac.Socket.sendByQueue(45801, [2, 1])
      },
      许愿签到: {
        async check() {
          return +!(await sac.Socket.multiValue(L.许愿签到))[0];
        },
        async run() {
          const s = (await sac.Socket.multiValue(L.许愿签到天数))[0];
          sac.Socket.sendByQueue(45801, [s + 1, 1]);
        }
      }
    });
  }
}
class nt {
  constructor() {
    l(this, "meta", {
      id: "teamDispatch",
      author: "median",
      type: "sign",
      description: "战队派遣"
    });
    l(this, "defaultConfig", { ignorePets: [] });
    l(this, "config");
    l(this, "export", {
      战队派遣: {
        check: () => Promise.resolve(1),
        async run() {
          await sac.Socket.sendByQueue(45809, [0]).catch(() => this.logger("没有可收取的派遣"));
          const s = new Set(this.config.ignorePets), u = sac.PetPosition;
          let k = !1;
          for (let D = 16; D > 0; D--) {
            D === 5 && (D = 1);
            const B = await sac.getBagPets(u.bag1);
            if (!k)
              for (const d of B)
                await d.popFromBag();
            const v = await sac.Socket.sendByQueue(45810, [D]).then((d) => new DataView(d)).catch((d) => {
            });
            if (!v)
              continue;
            const _ = v.getUint32(4), g = {
              petIds: [],
              cts: [],
              levels: []
            };
            for (let d = 0; d < _; d++)
              g.cts.push(v.getUint32(8 + d * 12)), g.petIds.push(v.getUint32(12 + d * 12)), g.levels.push(v.getUint32(16 + d * 12));
            this.logger(`正在处理派遣任务: ${D}`), k = g.petIds.some((d) => s.has(PetXMLInfo.getName(d)));
            let w = 0;
            for (const d of g.petIds) {
              const S = PetXMLInfo.getName(d);
              s.has(S) && (await sac.SAPet.setLocation(g.cts[w], sac.SAPetLocation.Bag), this.logger(`取出非派遣精灵: ${S}`)), w++;
            }
            k ? D++ : (console.table(g.petIds.map((d) => PetXMLInfo.getName(d))), sac.Socket.sendByQueue(45808, [D, g.cts[0], g.cts[1], g.cts[2], g.cts[3], g.cts[4]]));
          }
        }
      }
    });
  }
}
const st = {
  资源生产次数: 12470
}, it = {
  战队道具: {
    不灭能量珠: 10
  }
};
class at {
  constructor() {
    l(this, "meta", {
      id: "Team",
      author: "median",
      type: "sign",
      description: "战队签到"
    });
    l(this, "defaultConfig", { exchangeId: it.战队道具.不灭能量珠 });
    l(this, "config");
    l(this, "export", {
      生产资源: {
        check: async () => {
          const s = (await sac.Socket.multiValue(st.资源生产次数))[0];
          return Math.max(0, 5 - s);
        },
        // RES_PRODUCT_BUY
        run: () => sac.Socket.sendByQueue(CommandID.RES_PRODUCTORBUY, [2, 0])
      },
      兑换道具: {
        check: async () => {
          const s = (await sac.Socket.multiValue(12471))[0];
          return Math.max(0, 3 - s);
        },
        // 有问题, 要先打开战队面板?
        run: () => sac.Socket.sendByQueue(2940, [1, this.config.exchangeId])
      }
    });
  }
}
const rt = {
  vip点数: {
    特性重组剂: 1,
    体力上限药: 2
  }
};
class ot {
  constructor() {
    l(this, "meta", {
      id: "Vip",
      author: "median",
      type: "sign",
      description: "vip签到"
    });
    l(this, "defaultConfig", { exchangeId: rt.vip点数.体力上限药 });
    l(this, "config");
    l(this, "export", {
      领取vip箱子: {
        check: async () => +!(await sac.Socket.multiValue(14204))[0],
        run: () => sac.Socket.sendByQueue(CommandID.SEER_VIP_DAILY_REWARD)
      },
      领取vip点数: {
        check: async () => +!(await sac.Socket.multiValue(11516))[0],
        run: () => sac.Socket.sendByQueue(CommandID.VIP_BONUS_201409, [1])
      },
      兑换vip道具: {
        check: async () => +(MainManager.actorInfo.vipScore >= 20),
        run: () => sac.Socket.sendByQueue(CommandID.VIP_SCORE_EXCHANGE, [this.config.exchangeId]).then(() => {
          EventManager.dispatchEventWith("vipRewardBuyOrGetItem");
        })
      }
    });
  }
}
var ut = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {};
function ct(y) {
  return y && y.__esModule && Object.prototype.hasOwnProperty.call(y, "default") ? y.default : y;
}
var G = { exports: {} };
(function(y, s) {
  (function(u, k) {
    y.exports = k();
  })(ut, function() {
    var u = 1e3, k = 6e4, D = 36e5, B = "millisecond", v = "second", _ = "minute", g = "hour", w = "day", d = "week", S = "month", X = "quarter", I = "year", Y = "date", j = "Invalid Date", J = /^(\d{4})[-/]?(\d{1,2})?[-/]?(\d{0,2})[Tt\s]*(\d{1,2})?:?(\d{1,2})?:?(\d{1,2})?[.:]?(\d+)?$/, Z = /\[([^\]]+)]|Y{1,4}|M{1,4}|D{1,2}|d{1,4}|H{1,2}|h{1,2}|a|A|m{1,2}|s{1,2}|Z{1,2}|SSS/g, z = { name: "en", weekdays: "Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"), months: "January_February_March_April_May_June_July_August_September_October_November_December".split("_"), ordinal: function(i) {
      var n = ["th", "st", "nd", "rd"], t = i % 100;
      return "[" + i + (n[(t - 20) % 10] || n[t] || n[0]) + "]";
    } }, H = function(i, n, t) {
      var a = String(i);
      return !a || a.length >= n ? i : "" + Array(n + 1 - a.length).join(t) + i;
    }, q = { s: H, z: function(i) {
      var n = -i.utcOffset(), t = Math.abs(n), a = Math.floor(t / 60), e = t % 60;
      return (n <= 0 ? "+" : "-") + H(a, 2, "0") + ":" + H(e, 2, "0");
    }, m: function i(n, t) {
      if (n.date() < t.date())
        return -i(t, n);
      var a = 12 * (t.year() - n.year()) + (t.month() - n.month()), e = n.clone().add(a, S), o = t - e < 0, r = n.clone().add(a + (o ? -1 : 1), S);
      return +(-(a + (t - e) / (o ? e - r : r - e)) || 0);
    }, a: function(i) {
      return i < 0 ? Math.ceil(i) || 0 : Math.floor(i);
    }, p: function(i) {
      return { M: S, y: I, w: d, d: w, D: Y, h: g, m: _, s: v, ms: B, Q: X }[i] || String(i || "").toLowerCase().replace(/s$/, "");
    }, u: function(i) {
      return i === void 0;
    } }, P = "en", T = {};
    T[P] = z;
    var Q = function(i) {
      return i instanceof E;
    }, V = function i(n, t, a) {
      var e;
      if (!n)
        return P;
      if (typeof n == "string") {
        var o = n.toLowerCase();
        T[o] && (e = o), t && (T[o] = t, e = o);
        var r = n.split("-");
        if (!e && r.length > 1)
          return i(r[0]);
      } else {
        var h = n.name;
        T[h] = n, e = h;
      }
      return !a && e && (P = e), e || !a && P;
    }, $ = function(i, n) {
      if (Q(i))
        return i.clone();
      var t = typeof n == "object" ? n : {};
      return t.date = i, t.args = arguments, new E(t);
    }, c = q;
    c.l = V, c.i = Q, c.w = function(i, n) {
      return $(i, { locale: n.$L, utc: n.$u, x: n.$x, $offset: n.$offset });
    };
    var E = function() {
      function i(t) {
        this.$L = V(t.locale, null, !0), this.parse(t);
      }
      var n = i.prototype;
      return n.parse = function(t) {
        this.$d = function(a) {
          var e = a.date, o = a.utc;
          if (e === null)
            return /* @__PURE__ */ new Date(NaN);
          if (c.u(e))
            return /* @__PURE__ */ new Date();
          if (e instanceof Date)
            return new Date(e);
          if (typeof e == "string" && !/Z$/i.test(e)) {
            var r = e.match(J);
            if (r) {
              var h = r[2] - 1 || 0, m = (r[7] || "0").substring(0, 3);
              return o ? new Date(Date.UTC(r[1], h, r[3] || 1, r[4] || 0, r[5] || 0, r[6] || 0, m)) : new Date(r[1], h, r[3] || 1, r[4] || 0, r[5] || 0, r[6] || 0, m);
            }
          }
          return new Date(e);
        }(t), this.$x = t.x || {}, this.init();
      }, n.init = function() {
        var t = this.$d;
        this.$y = t.getFullYear(), this.$M = t.getMonth(), this.$D = t.getDate(), this.$W = t.getDay(), this.$H = t.getHours(), this.$m = t.getMinutes(), this.$s = t.getSeconds(), this.$ms = t.getMilliseconds();
      }, n.$utils = function() {
        return c;
      }, n.isValid = function() {
        return this.$d.toString() !== j;
      }, n.isSame = function(t, a) {
        var e = $(t);
        return this.startOf(a) <= e && e <= this.endOf(a);
      }, n.isAfter = function(t, a) {
        return $(t) < this.startOf(a);
      }, n.isBefore = function(t, a) {
        return this.endOf(a) < $(t);
      }, n.$g = function(t, a, e) {
        return c.u(t) ? this[a] : this.set(e, t);
      }, n.unix = function() {
        return Math.floor(this.valueOf() / 1e3);
      }, n.valueOf = function() {
        return this.$d.getTime();
      }, n.startOf = function(t, a) {
        var e = this, o = !!c.u(a) || a, r = c.p(t), h = function(x, M) {
          var C = c.w(e.$u ? Date.UTC(e.$y, M, x) : new Date(e.$y, M, x), e);
          return o ? C : C.endOf(w);
        }, m = function(x, M) {
          return c.w(e.toDate()[x].apply(e.toDate("s"), (o ? [0, 0, 0, 0] : [23, 59, 59, 999]).slice(M)), e);
        }, f = this.$W, p = this.$M, O = this.$D, b = "set" + (this.$u ? "UTC" : "");
        switch (r) {
          case I:
            return o ? h(1, 0) : h(31, 11);
          case S:
            return o ? h(1, p) : h(0, p + 1);
          case d:
            var N = this.$locale().weekStart || 0, W = (f < N ? f + 7 : f) - N;
            return h(o ? O - W : O + (6 - W), p);
          case w:
          case Y:
            return m(b + "Hours", 0);
          case g:
            return m(b + "Minutes", 1);
          case _:
            return m(b + "Seconds", 2);
          case v:
            return m(b + "Milliseconds", 3);
          default:
            return this.clone();
        }
      }, n.endOf = function(t) {
        return this.startOf(t, !1);
      }, n.$set = function(t, a) {
        var e, o = c.p(t), r = "set" + (this.$u ? "UTC" : ""), h = (e = {}, e[w] = r + "Date", e[Y] = r + "Date", e[S] = r + "Month", e[I] = r + "FullYear", e[g] = r + "Hours", e[_] = r + "Minutes", e[v] = r + "Seconds", e[B] = r + "Milliseconds", e)[o], m = o === w ? this.$D + (a - this.$W) : a;
        if (o === S || o === I) {
          var f = this.clone().set(Y, 1);
          f.$d[h](m), f.init(), this.$d = f.set(Y, Math.min(this.$D, f.daysInMonth())).$d;
        } else
          h && this.$d[h](m);
        return this.init(), this;
      }, n.set = function(t, a) {
        return this.clone().$set(t, a);
      }, n.get = function(t) {
        return this[c.p(t)]();
      }, n.add = function(t, a) {
        var e, o = this;
        t = Number(t);
        var r = c.p(a), h = function(p) {
          var O = $(o);
          return c.w(O.date(O.date() + Math.round(p * t)), o);
        };
        if (r === S)
          return this.set(S, this.$M + t);
        if (r === I)
          return this.set(I, this.$y + t);
        if (r === w)
          return h(1);
        if (r === d)
          return h(7);
        var m = (e = {}, e[_] = k, e[g] = D, e[v] = u, e)[r] || 1, f = this.$d.getTime() + t * m;
        return c.w(f, this);
      }, n.subtract = function(t, a) {
        return this.add(-1 * t, a);
      }, n.format = function(t) {
        var a = this, e = this.$locale();
        if (!this.isValid())
          return e.invalidDate || j;
        var o = t || "YYYY-MM-DDTHH:mm:ssZ", r = c.z(this), h = this.$H, m = this.$m, f = this.$M, p = e.weekdays, O = e.months, b = function(M, C, R, U) {
          return M && (M[C] || M(a, o)) || R[C].slice(0, U);
        }, N = function(M) {
          return c.s(h % 12 || 12, M, "0");
        }, W = e.meridiem || function(M, C, R) {
          var U = M < 12 ? "AM" : "PM";
          return R ? U.toLowerCase() : U;
        }, x = { YY: String(this.$y).slice(-2), YYYY: c.s(this.$y, 4, "0"), M: f + 1, MM: c.s(f + 1, 2, "0"), MMM: b(e.monthsShort, f, O, 3), MMMM: b(O, f), D: this.$D, DD: c.s(this.$D, 2, "0"), d: String(this.$W), dd: b(e.weekdaysMin, this.$W, p, 2), ddd: b(e.weekdaysShort, this.$W, p, 3), dddd: p[this.$W], H: String(h), HH: c.s(h, 2, "0"), h: N(1), hh: N(2), a: W(h, m, !0), A: W(h, m, !1), m: String(m), mm: c.s(m, 2, "0"), s: String(this.$s), ss: c.s(this.$s, 2, "0"), SSS: c.s(this.$ms, 3, "0"), Z: r };
        return o.replace(Z, function(M, C) {
          return C || x[M] || r.replace(":", "");
        });
      }, n.utcOffset = function() {
        return 15 * -Math.round(this.$d.getTimezoneOffset() / 15);
      }, n.diff = function(t, a, e) {
        var o, r = c.p(a), h = $(t), m = (h.utcOffset() - this.utcOffset()) * k, f = this - h, p = c.m(this, h);
        return p = (o = {}, o[I] = p / 12, o[S] = p, o[X] = p / 3, o[d] = (f - m) / 6048e5, o[w] = (f - m) / 864e5, o[g] = f / D, o[_] = f / k, o[v] = f / u, o)[r] || f, e ? p : c.a(p);
      }, n.daysInMonth = function() {
        return this.endOf(S).$D;
      }, n.$locale = function() {
        return T[this.$L];
      }, n.locale = function(t, a) {
        if (!t)
          return this.$L;
        var e = this.clone(), o = V(t, a, !0);
        return o && (e.$L = o), e;
      }, n.clone = function() {
        return c.w(this.$d, this);
      }, n.toDate = function() {
        return new Date(this.valueOf());
      }, n.toJSON = function() {
        return this.isValid() ? this.toISOString() : null;
      }, n.toISOString = function() {
        return this.$d.toISOString();
      }, n.toString = function() {
        return this.$d.toUTCString();
      }, i;
    }(), F = E.prototype;
    return $.prototype = F, [["$ms", B], ["$s", v], ["$m", _], ["$H", g], ["$W", w], ["$M", S], ["$y", I], ["$D", Y]].forEach(function(i) {
      F[i[1]] = function(n) {
        return this.$g(n, i[0], i[1]);
      };
    }), $.extend = function(i, n) {
      return i.$i || (i(n, E, $), i.$i = !0), $;
    }, $.locale = V, $.isDayjs = Q, $.unix = function(i) {
      return $(1e3 * i);
    }, $.en = T[P], $.Ls = T, $.p = {}, $;
  });
})(G);
var ht = G.exports;
const A = /* @__PURE__ */ ct(ht);
class ft {
  constructor() {
    l(this, "meta", {
      id: "14YearsAnniversary",
      author: "median",
      type: "sign",
      description: "14周年庆签到"
    });
    l(this, "defaultConfig", {
      signCookie: "",
      userId: ""
    });
    l(this, "config");
    l(this, "subDaysWY", A().diff(A("2023-06-01"), "d"));
    l(this, "subDaysWXC", A().diff(A("2023-06-08"), "d"));
    l(this, "export", {
      主题站签到: {
        check: () => Promise.resolve(this.config ? 1 : 0),
        run: async () => {
          const s = new URLSearchParams({
            PHPSESSID: this.config.signCookie,
            cookie_login_uid: this.config.userId
          }), u = await fetch(`/api/14year/?${s.toString()}`);
          this.logger("签到结果: ", await u.json());
        }
      },
      领取卫岳因子: {
        check: async () => {
          let s;
          const u = await sac.Socket.multiValue(121581, 121582);
          return this.subDaysWY >= 32 ? s = u[1] & 1 << this.subDaysWY - 32 : s = u[0] & 1 << this.subDaysWY - 1, +!s;
        },
        run: () => {
          sac.Socket.sendByQueue(41388, [64, this.subDaysWY]);
        }
      },
      领取武心婵因子: {
        check: async () => {
          let s;
          const u = await sac.Socket.multiValue(121583);
          return this.subDaysWXC >= 32 ? s = u[1] & 1 << this.subDaysWXC - 32 : s = u[0] & 1 << this.subDaysWXC - 1, +!s;
        },
        run: () => {
          sac.Socket.sendByQueue(41388, [65, this.subDaysWXC]);
        }
      }
    });
  }
}
const lt = [ft, et, at, nt, ot];
export {
  lt as default
};
//# sourceMappingURL=sign.js.map
