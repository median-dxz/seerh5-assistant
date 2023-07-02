var logFilter = new Proxy(console.log, {
    apply: function (target, _this, args) {
        if (args.every((v) => typeof v == 'string')) {
            args = args.filter((v) => !sac.filterLogText.some((reg) => v.match(reg)));
            args.length > 0 && Reflect.apply(target, _this, args);
        } else {
            Reflect.apply(target, _this, args);
        }
    },
});

var warnFilter = new Proxy(console.warn, {
    apply: function (target, _this, args) {
        if (args.every((v) => typeof v == 'string')) {
            args = args.filter((v) => !sac.filterWarnText.some((reg) => v.match(reg)));
            args.length > 0 && Reflect.apply(target, _this, args);
        } else {
            Reflect.apply(target, _this, args);
        }
    },
});

var sac = {
    SeerH5Ready: false,
    SacReady: false,
    filterLogText: [
        /=.*?lifecycle.on.*=.*?$/,
        /(M|m)usic/,
        /sound length.*?[0-9]*$/,
        /module width.*?[0-9]*$/,
        /=*?this._percent=*/,
        /bossIcon——Index/,
        /加载cjs 动画preview.*$/,
    ],
    filterWarnText: [
        /开始执行战斗动画/,
        /=.*?onUseSkill=.*=/,
        />.*?>面板.*?还没有.*$/,
        /head hit.*?index/,
        /PetID:.*?offsetX:/,
        /head.petInfo:/,
        /battleResultPanel/,
        /GuideManager.isCompleted/,
    ],
};

var __reflect =
    (this && this.__reflect) ||
    function (e, t, n) {
        (e.__class__ = t), n ? n.push(t) : (n = [t]), (e.__types__ = e.__types__ ? n.concat(e.__types__) : n);
    };

var __extends =
    (this && this.__extends) ||
    function (e, t) {
        function n() {
            this.constructor = e;
        }
        for (var i in t) Object.hasOwn(t, i) && (e[i] = t[i]);
        (n.prototype = t.prototype), (e.prototype = new n());
    };

var __awaiter =
    (this && this.__awaiter) ||
    function (e, t, n, i) {
        return new (n || (n = Promise))(function (r, o) {
            function s(e) {
                try {
                    l(i.next(e));
                } catch (t) {
                    o(t);
                }
            }
            function a(e) {
                try {
                    l(i['throw'](e));
                } catch (t) {
                    o(t);
                }
            }
            function l(e) {
                e.done
                    ? r(e.value)
                    : new n(function (t) {
                          t(e.value);
                      }).then(s, a);
            }
            l((i = i.apply(e, t || [])).next());
        });
    };

var __generator =
    (this && this.__generator) ||
    function (e, t) {
        function n(e) {
            return function (t) {
                return i([e, t]);
            };
        }
        function i(n) {
            if (r) throw new TypeError('Generator is already executing.');
            for (; l; )
                try {
                    if (
                        ((r = 1),
                        o && (s = o[2 & n[0] ? 'return' : n[0] ? 'throw' : 'next']) && !(s = s.call(o, n[1])).done)
                    )
                        return s;
                    switch (((o = 0), s && (n = [0, s.value]), n[0])) {
                        case 0:
                        case 1:
                            s = n;
                            break;
                        case 4:
                            return l.label++, { value: n[1], done: !1 };
                        case 5:
                            l.label++, (o = n[1]), (n = [0]);
                            continue;
                        case 7:
                            (n = l.ops.pop()), l.trys.pop();
                            continue;
                        default:
                            if (((s = l.trys), !(s = s.length > 0 && s[s.length - 1]) && (6 === n[0] || 2 === n[0]))) {
                                l = 0;
                                continue;
                            }
                            if (3 === n[0] && (!s || (n[1] > s[0] && n[1] < s[3]))) {
                                l.label = n[1];
                                break;
                            }
                            if (6 === n[0] && l.label < s[1]) {
                                (l.label = s[1]), (s = n);
                                break;
                            }
                            if (s && l.label < s[2]) {
                                (l.label = s[2]), l.ops.push(n);
                                break;
                            }
                            s[2] && l.ops.pop(), l.trys.pop();
                            continue;
                    }
                    n = t.call(e, l);
                } catch (i) {
                    (n = [6, i]), (o = 0);
                } finally {
                    r = s = 0;
                }
            if (5 & n[0]) throw n[1];
            return { value: n[0] ? n[1] : void 0, done: !0 };
        }
        var r,
            o,
            s,
            a,
            l = {
                label: 0,
                sent: function () {
                    if (1 & s[0]) throw s[1];
                    return s[1];
                },
                trys: [],
                ops: [],
            };
        return (
            (a = { next: n(0), throw: n(1), return: n(2) }),
            'function' == typeof Symbol &&
                (a[Symbol.iterator] = function () {
                    return this;
                }),
            a
        );
    };

var AssetAdapter = (function () {
    function e() {}
    return (
        (e.prototype.getAsset = function (e, t, n) {
            function i(i) {
                t.call(n, i, e);
            }
            if (RES.hasRes(e)) {
                var r = RES.getRes(e);
                r ? i(r) : RES.getResAsync(e, i, this);
            } else RES.getResByUrl(e, i, this, RES.ResourceItem.TYPE_IMAGE);
        }),
        e
    );
})();
__reflect(AssetAdapter.prototype, 'AssetAdapter', ['eui.IAssetAdapter']);

var Driver = (function () {
    function Driver() {}
    return (
        (Driver.init = function (e, t, n) {
            e && e.length > 0 && ((Driver.configs = e), (Driver.callback = t), (Driver.thisObj = n), Driver.doAction());
        }),
        (Driver.doAction = function () {
            if (0 == Driver.configs.length) return void Driver.callback.call(Driver.thisObj);
            var config = (Driver.currConfig = Driver.configs.shift());
            if ('js' == config.type)
                if (IS_RELEASE)
                    RES.getResByUrl(
                        config.url,
                        function (data, url) {
                            var script = document.createElement('script');
                            script.type = 'text/javascript';
                            // loader modify begin
                            while (data.startsWith('eval')) {
                                data = eval(data.match(/eval([^)].*)/)[1]);
                            }
                            data = data.replaceAll(/console\.log/g, 'logFilter');
                            data = data.replaceAll(/console\.warn/g, 'warnFilter');
                            script.text = '//@ sourceURL=http://seerh5.61.com/' + url + '\n' + data;

                            document.head.appendChild(script).parentNode.removeChild(script);
                            if (config.action === 'Core.init') {
                                // dispatch event begin
                                window.dispatchEvent(new CustomEvent('seerh5_load'));
                                sac.SeerH5Ready = true;
                                // dispatch event end
                                Driver.doAction();
                            } else {
                                config.action && config.action.length > 0 && eval(config.action + '()'),
                                    Driver.doAction();
                            }
                            // loader modify end
                        },
                        this,
                        'text'
                    );
                else {
                    var s = document.createElement('script');
                    (s.type = 'text/javascript'), (s.async = !1);
                    var loaded = function () {
                        s.parentNode.removeChild(s),
                            s.removeEventListener('load', loaded, !1),
                            config.action && config.action.length > 0 && eval(config.action + '()'),
                            Driver.doAction();
                    };
                    s.addEventListener('load', loaded, !1);
                    var url = RES.getVersionController().getVirtualUrl(config.url);
                    (s.src = url), document.body.appendChild(s);
                }
            else
                'res' == config.type
                    ? RES.loadConfig(config.url, config.param).then(function () {
                          RES.loadGroup(config.name).then(
                              function () {
                                  Driver.doAction();
                              },
                              function () {
                                  console.error('加载失败');
                              }
                          );
                      })
                    : 'json' == config.type &&
                      RES.getResByUrl(
                          config.url,
                          function (e, t) {
                              (SeerCache.config[config.name] = e), Driver.doAction();
                          },
                          this,
                          'json'
                      );
        }),
        Driver
    );
})();
__reflect(Driver.prototype, 'Driver');

var Main = (function (e) {
    function t() {
        var t = e.call(this) || this;
        return t._overrideHandler(), t;
    }
    return (
        __extends(t, e),
        (t.prototype.createChildren = function () {
            e.prototype.createChildren.call(this),
                'true' == egret.getOption('isApp') && (GameInfo.isApp = !0),
                this.setInputUp(),
                (window.SeerCache = window.SeerCache || { config: {} });
            var t = new AssetAdapter();
            egret.registerImplementation('eui.IAssetAdapter', t),
                egret.registerImplementation('eui.IThemeAdapter', new ThemeAdapter()),
                (egret.ImageLoader.crossOrigin = 'anonymous'),
                (RES.VersionController = SeerVersionController);
            var n = this,
                i = GameInfo.wwwRoot + 'version/version.json?t' + Math.random();
            this.loadVersionFile(i).then(function (e) {
                e &&
                    ((SeerVersionController.remoteVersion = JSON.parse('' + e)),
                    (GameInfo.currAssetVersion = SeerVersionController.remoteVersion.version)),
                    GameInfo.isApp
                        ? n.loadVersionFile('./version/version_local.json').then(function (e) {
                              e && (SeerVersionController.localVersion = JSON.parse('' + e)),
                                  n
                                      .runGame()
                                      .then(function () {})
                                      .catch(function (e) {
                                          console.warn(e);
                                      });
                          })
                        : n.runGame().catch(function (e) {
                              console.warn(e);
                          });
            });
        }),
        (t.prototype.loadVersionFile = function (e) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (t) {
                    return (
                        GameInfo.isApp,
                        [
                            2,
                            new Promise(function (t, n) {
                                if ((GameInfo.isApp, IS_RELEASE)) {
                                    var i = e,
                                        r = new egret.HttpRequest(),
                                        o = function (e) {
                                            switch (e.type) {
                                                case egret.Event.COMPLETE:
                                                    var n = e.currentTarget;
                                                    GameInfo.isApp, t(n.response);
                                                    break;
                                                case egret.IOErrorEvent.IO_ERROR:
                                                    GameInfo.isApp;
                                            }
                                        },
                                        s = function (e) {};
                                    r.once(egret.Event.COMPLETE, o, null),
                                        r.once(egret.IOErrorEvent.IO_ERROR, o, null),
                                        r.once(egret.ProgressEvent.PROGRESS, s, null),
                                        r.open(i, egret.HttpMethod.GET),
                                        r.send();
                                } else t(null);
                            }),
                        ]
                    );
                });
            });
        }),
        (t.prototype.runGame = function () {
            return __awaiter(this, void 0, void 0, function () {
                var e;
                return __generator(this, function (t) {
                    switch (t.label) {
                        case 0:
                            return [4, this.loadResource()];
                        case 1:
                            return t.sent(), [4, RES.getResAsync('driver_json')];
                        case 2:
                            return (e = t.sent()), Driver.init(e, this.driverComplete, this), [2];
                    }
                });
            });
        }),
        (t.prototype.driverComplete = function () {
            window.LevelManager.setup(this);
            window.MainManager.stage = this;
            window.ModuleManager.showModuleByID(140).then(() => {
                window.hideWebload && window.hideWebload();
            });
        }),
        (t.prototype.onselectSeverOver = function () {}),
        (t.prototype.loadResource = function () {
            return __awaiter(this, void 0, void 0, function () {
                var e;
                return __generator(this, function (t) {
                    switch (t.label) {
                        case 0:
                            return (
                                t.trys.push([0, 4, undefined, 5]),
                                [4, RES.loadConfig('resource/assets/ui/entry.json', 'resource/assets/ui/')]
                            );
                        case 1:
                            return t.sent(), [4, this.loadTheme()];
                        case 2:
                            return t.sent(), [4, RES.loadGroup('entry')];
                        case 3:
                            return t.sent(), [3, 5];
                        case 4:
                            return (e = t.sent()), console.error(e), [3, 5];
                        case 5:
                            return [2];
                    }
                });
            });
        }),
        (t.prototype.loadCommon = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (e) {
                    switch (e.label) {
                        case 0:
                            return [4, RES.loadConfig('resource/assets/ui/common.json', 'resource/assets/ui/')];
                        case 1:
                            return e.sent(), [4, RES.loadGroup('common')];
                        case 2:
                            return e.sent(), [2];
                    }
                });
            });
        }),
        (t.prototype.loadTheme = function () {
            var e = this;
            return new Promise(function (t, n) {
                var i = new eui.Theme('resource/default.thm.json', e.stage);
                i.addEventListener(
                    eui.UIEvent.COMPLETE,
                    function () {
                        t();
                    },
                    e
                );
            });
        }),
        (t.prototype.setInputUp = function () {
            var e = window.innerHeight,
                t = 0,
                n = 0;
            GameInfo.isApp &&
                1 == GameInfo.platform &&
                (window.addEventListener('native.keyboardshow', function (i) {
                    var r = document.getElementById('bg');
                    r || ((r = document.createElement('div')), (r.id = 'bg'), document.body.appendChild(r)),
                        (r.style.height = e + i.keyboardHeight + 'px'),
                        0 == n &&
                            window.setTimeout(function () {
                                e - t - i.keyboardHeight < 15 &&
                                    ((n = i.keyboardHeight - (e - t) + 30), window.scrollTo(0, n));
                            }, 100);
                }),
                window.addEventListener('native.keyboardhide', function (e) {
                    window.scrollTo(0, 0);
                    var t = document.getElementById('bg');
                    t && (t.style.height = '0px'), (n = 0);
                }),
                (egret.web.HTML5StageText.prototype._onClickHandler = function (e) {
                    this._isNeedShow &&
                        (e.stopImmediatePropagation(),
                        (this._isNeedShow = !1),
                        (t = e.clientY),
                        this.executeShow(),
                        this.dispatchEvent(new egret.Event('focus')));
                }),
                (egret.web.HTML5StageText.prototype._onDisconnect = function () {
                    (this.inputElement = null), this.dispatchEvent(new egret.Event('blur')), (n = 0);
                }));
        }),
        (t.prototype._overrideHandler = function () {
            this._overrideConsoleFun(),
                this._overRideInputElement(),
                this.overrideWebImageLoader(),
                this.overrideTextInputScroll(),
                this._overInputHandler();
        }),
        (t.prototype._overrideConsoleFun = function () {
            egret.getOption('log') || window.log;
            console.table || (console.table = function () {});
        }),
        (t.prototype._overInputHandler = function () {
            eui.TextInput.prototype.inputLock = !1;
            var e = eui.TextInput.prototype.focusInHandler;
            eui.TextInput.prototype.focusInHandler = function (t) {
                e.call(this, t);
                var n = this.textDisplay;
                if (n.inputUtils && n.inputUtils.stageText && n.inputUtils.stageText.inputElement) {
                    var i = n.inputUtils.stageText.inputElement,
                        r = this,
                        o = function () {
                            r.inputLock = !0;
                        },
                        s = function () {
                            r.inputLock = !1;
                        },
                        a = function () {
                            i &&
                                (i.removeEventListener('compositionstart', o),
                                i.removeEventListener('compositionend', s),
                                i.removeEventListener('blur', a),
                                (i = null),
                                (r.inputLock = !1));
                        };
                    i.addEventListener('compositionstart', o),
                        i.addEventListener('compositionend', s),
                        i.addEventListener('blur', a);
                }
            };
        }),
        (t.prototype._overRideInputElement = function () {
            GameInfo.isMobile &&
                (egret.web.HTMLInput.prototype.clearInputElement = function () {
                    var e = this;
                    if (e._inputElement) {
                        (e._inputElement.value = ''),
                            (e._inputElement.onblur = null),
                            (e._inputElement.style.width = '1px'),
                            (e._inputElement.style.height = '12px'),
                            (e._inputElement.style.left = '0px'),
                            (e._inputElement.style.top = '0px'),
                            (e._inputElement.style.opacity = 0);
                        var t = void 0;
                        (t = e._simpleElement == e._inputElement ? e._multiElement : e._simpleElement),
                            (t.style.display = 'block'),
                            (e._inputDIV.style.left = '0px'),
                            (e._inputDIV.style.top = '-100px'),
                            (e._inputDIV.style.height = '0px'),
                            (e._inputDIV.style.width = '0px'),
                            'password' == e._inputElement.type &&
                                (e._inputDIV.removeChild(e._inputElement),
                                (e._inputElement = null),
                                e.initInputElement(!1));
                    }
                    e._stageText &&
                        (e._stageText._onDisconnect(), (e._stageText = null), (this.canvas.userTyping = !1));
                });
        }),
        (t.prototype.overrideHttpRequest = function () {
            var e = 3,
                t = egret.web.WebHttpRequest;
            t.prototype.retryTimes = 0;
            var n = t.prototype.onload,
                i = t.prototype.onerror;
            (t.prototype.onload = function () {
                var t = this,
                    i = this._xhr,
                    r = i.status >= 400;
                r
                    ? navigator.onLine
                        ? this.retryTimes < e
                            ? (this.retryTimes++,
                              egret.setTimeout(
                                  function () {
                                      t.abort(), t.open(t._url, t._method), t.send();
                                  },
                                  this,
                                  600
                              ))
                            : n.call(this)
                        : egret.setTimeout(
                              function () {
                                  t.abort(), t.open(t._url, t._method), t.send();
                              },
                              this,
                              2e3
                          )
                    : n.call(this);
            }),
                (t.prototype.onerror = function () {
                    var t = this;
                    this._xhr;
                    navigator.onLine
                        ? this.retryTimes < e
                            ? (this.retryTimes++,
                              egret.setTimeout(
                                  function () {
                                      t.abort(), t.open(t._url, t._method), t.send();
                                  },
                                  this,
                                  600
                              ))
                            : (window.Sentry && window.Sentry.captureMessage('资源加载失败:' + this._url), i.call(this))
                        : egret.setTimeout(
                              function () {
                                  t.abort(), t.open(t._url, t._method), t.send();
                              },
                              this,
                              2e3
                          );
                });
        }),
        (t.prototype.overrideWebImageLoader = function () {
            var e = 3,
                t = egret.ImageLoader;
            t.prototype.retryTimes = 0;
            var n = t.prototype.onLoadError,
                i = t.prototype.onBlobLoaded,
                r = t.prototype.onImageComplete,
                o = RES.getResByUrl;
            if (
                ((RES.getResByUrl = function (e, t, n, i) {
                    void 0 === i && (i = '');
                    var r = function (e, i) {
                        t && t.call(n, e, i);
                    };
                    return o(e, r, this, i);
                }),
                (t.prototype.onBlobLoaded = function (e) {
                    i.call(this, e);
                }),
                (t.prototype.onImageComplete = function (e) {
                    r.call(this, e);
                }),
                (t.prototype.onLoadError = function (t) {
                    var i = this,
                        r = t.target,
                        o = r.src;
                    if ((console.error('error ===============>' + o), navigator.onLine))
                        this.retryTimes < e
                            ? (this.retryTimes++,
                              (r.onerror = null),
                              (r.onload = null),
                              egret.setTimeout(
                                  function () {
                                      i.loadImage(o);
                                  },
                                  this,
                                  600
                              ))
                            : n.call(this, t);
                    else {
                        if (((r.onerror = null), (r.onload = null), this.currentImage !== r)) return null;
                        (this.currentImage = null),
                            egret.setTimeout(
                                function () {
                                    i.loadImage(o);
                                },
                                this,
                                2e3
                            );
                    }
                }),
                GameInfo.isApp && 2 == GameInfo.platform)
            ) {
                t.prototype.load;
                t.prototype.load = function (e) {
                    var t = this.request;
                    t ||
                        ((t = this.request = new egret.HttpRequest()),
                        t.addEventListener(egret.Event.COMPLETE, this.onBlobLoaded, this),
                        t.addEventListener(egret.IOErrorEvent.IO_ERROR, this.onBlobError, this),
                        (t.responseType = 'blob')),
                        (this.currentURL = e),
                        t.open(e),
                        t.send();
                };
            }
        }),
        (t.prototype.overrideTextInputScroll = function () {
            egret.Capabilities.isMobile ||
                ((HTMLInputElement.prototype.scrollIntoView = function () {}),
                (HTMLTextAreaElement.prototype.scrollIntoView = function () {}));
        }),
        t
    );
})(eui.UILayer);
__reflect(Main.prototype, 'Main');

var LoadingUI = (function (e) {
    function t() {
        var t = e.call(this) || this;
        return t.createView(), t;
    }
    return (
        __extends(t, e),
        (t.prototype.createView = function () {
            (this.textField = new egret.TextField()),
                this.addChild(this.textField),
                (this.textField.width = 480),
                (this.textField.height = 100),
                (this.textField.textAlign = 'center');
        }),
        (t.prototype.onProgress = function (e, t) {
            this.textField.text = 'Loading...' + e + '/' + t;
        }),
        t
    );
})(egret.Sprite);
__reflect(LoadingUI.prototype, 'LoadingUI', ['RES.PromiseTaskReporter']);

var SeerVersionController = (function () {
    function e() {}
    return (
        (e.prototype.init = function () {
            return (
                GameInfo.isApp &&
                    FileSystemUtil.requestFileSystem()
                        .then(function (t) {
                            (FileSystemUtil.fs = t),
                                t.root.getFile(
                                    e.cacheFileUri,
                                    { create: !0, exclusive: !1 },
                                    function (t) {
                                        t.file(
                                            function (t) {
                                                var n = new FileReader();
                                                (n.onloadend = function () {
                                                    n.result && (e.urlCache = JSON.parse('' + n.result));
                                                }),
                                                    n.readAsText(t);
                                            },
                                            function () {}
                                        ),
                                            e.createWriter(t);
                                    },
                                    function () {}
                                );
                        })
                        .then(function () {}),
                Promise.resolve()
            );
        }),
        (e.createWriter = function (t) {
            t.createWriter(function (t) {
                (e.fileWriter = t),
                    (t.onwriteend = function () {}),
                    (t.onerror = function (e) {
                        console.warn('Failed file read: ' + e.toString());
                    });
            });
        }),
        (e.writeCacheList = function () {
            if (e.fileWriter) {
                e.fileWriter.seek(0);
                var t = new Blob([JSON.stringify(e.urlCache)], { type: 'text/plain' });
                e.fileWriter.write(t);
            }
        }),
        (e.prototype.getVirtualUrl = function (t) {
            return e.getVersionUrl(t);
        }),
        (e.getVersionUrl = function (t) {
            if (!t || -1 != t.search(/^\/|^\w+:\/\//)) return t;
            if (GameInfo.isApp && 'preview' == GameInfo.channel) return GameInfo.wwwRoot + t + '?t=' + Date.now();
            var n = t.split('/'),
                i = n[n.length - 1],
                r = '',
                o = e.localVersion.files,
                s = e.remoteVersion.files,
                a = e.getUrlVerName(n, s);
            if (GameInfo.isApp) {
                r = e.getUrlVerName(n, o);
                var l = i.split('.'),
                    u = l[l.length - 1],
                    c = i.replace('.' + u, ''),
                    h = egret.getOption('version');
                if ('10000' != h && r.length > 0) {
                    if (0 == a.length)
                        return (t = cordova.file.applicationDirectory + 'www/' + t.replace(i, c + '_' + r + '.' + u));
                    if (c + '_' + r + '.' + u == a)
                        return (t = cordova.file.applicationDirectory + 'www/' + t.replace(i, c + '_' + r + '.' + u));
                    a.length > 0 && (t = t.replace(i, a));
                }
            }
            if ((a.length > 0 && (t = t.replace(i, a)), (t = GameInfo.wwwRoot + t), !IS_RELEASE)) {
                var p = egret.getOption('ver');
                p && (t = t + '?ver=' + p);
            }
            return t;
        }),
        (e.getUrlVerName = function (e, t) {
            for (var n = t, i = e, r = n, o = i.length, s = '', a = 0; r && o > a; a++) r = r[i[a]];
            return r && (s = r), s;
        }),
        (e.downCacheFile = function () {
            var t = this;
            this.needCacheList.length >= 25 &&
                ((this.needCacheList = []),
                window.fileCache.isDirty() &&
                    !this.caching &&
                    ((this.caching = !0),
                    window.fileCache
                        .download(
                            function () {
                                e.writeCacheList();
                            },
                            function () {}
                        )
                        .then(function () {
                            t.caching = !1;
                        })));
        }),
        (e.prototype.getLocalData = function (e) {
            return null;
        }),
        (e.root = ''),
        (e.remoteVersion = { files: {} }),
        (e.localVersion = { files: {} }),
        (e.cacheFileUri = 'cache_key.json'),
        (e.urlCache = {}),
        (e.needCacheList = []),
        (e.caching = !1),
        e
    );
})();
__reflect(SeerVersionController.prototype, 'SeerVersionController', ['RES.IVersionController']);

var ThemeAdapter = (function () {
    function e() {}
    return (
        (e.prototype.getTheme = function (e, t, n, i) {
            function r(e) {
                t.call(i, e);
            }
            function o(t) {
                t.resItem.url == e && (RES.removeEventListener(RES.ResourceEvent.ITEM_LOAD_ERROR, o, null), n.call(i));
            }
            var s = this;
            if ('undefined' != typeof generateEUI)
                egret.callLater(function () {
                    t.call(i, generateEUI);
                }, this);
            else if ('undefined' != typeof generateEUI2)
                RES.getResByUrl(
                    'resource/gameEui.json',
                    function (e, n) {
                        window.JSONParseClass.setData(e),
                            egret.callLater(function () {
                                t.call(i, generateEUI2);
                            }, s);
                    },
                    this,
                    RES.ResourceItem.TYPE_JSON
                );
            else if ('undefined' != typeof generateJSON)
                if (e.indexOf('.exml') > -1) {
                    var a = e.split('/');
                    a.pop();
                    var l = a.join('/') + '_EUI.json';
                    generateJSON.paths[e]
                        ? egret.callLater(function () {
                              t.call(i, generateJSON.paths[e]);
                          }, this)
                        : RES.getResByUrl(
                              l,
                              function (n) {
                                  window.JSONParseClass.setData(n),
                                      egret.callLater(function () {
                                          t.call(i, generateJSON.paths[e]);
                                      }, s);
                              },
                              this,
                              RES.ResourceItem.TYPE_JSON
                          );
                } else
                    egret.callLater(function () {
                        t.call(i, generateJSON);
                    }, this);
            else
                RES.addEventListener(RES.ResourceEvent.ITEM_LOAD_ERROR, o, null),
                    RES.getResByUrl(e, r, this, RES.ResourceItem.TYPE_TEXT);
        }),
        e
    );
})();
__reflect(ThemeAdapter.prototype, 'ThemeAdapter', ['eui.IThemeAdapter']), (window.skins = window.skins || {});

(window.generateEUI = window.generateEUI || {}),
    (generateEUI.paths = generateEUI.paths || {}),
    (generateEUI.styles = void 0),
    (generateEUI.skins = {
        'eui.Button': 'resource/eui_skins/ButtonSkin.exml',
        'eui.CheckBox': 'resource/eui_skins/CheckBoxSkin.exml',
        'eui.HScrollBar': 'resource/eui_skins/HScrollBarSkin.exml',
        'eui.HSlider': 'resource/eui_skins/HSliderSkin.exml',
        'eui.Panel': 'resource/eui_skins/PanelSkin.exml',
        'eui.TextInput': 'resource/eui_skins/TextInputSkin.exml',
        'eui.ProgressBar': 'resource/eui_skins/ProgressBarSkin.exml',
        'eui.RadioButton': 'resource/eui_skins/RadioButtonSkin.exml',
        'eui.Scroller': 'resource/eui_skins/ScrollerSkin.exml',
        'eui.ToggleSwitch': 'resource/eui_skins/ToggleSwitchSkin.exml',
        'eui.VScrollBar': 'resource/eui_skins/VScrollBarSkin.exml',
        'eui.VSlider': 'resource/eui_skins/VSliderSkin.exml',
        'eui.ItemRenderer': 'resource/eui_skins/ItemRendererSkin.exml',
    }),
    (generateEUI.paths['resource/eui_skins/ButtonSkin.exml'] = window.skins.ButtonSkin =
        (function (e) {
            function t() {
                e.call(this),
                    (this.skinParts = ['labelDisplay', 'iconDisplay']),
                    (this.minHeight = 50),
                    (this.minWidth = 100),
                    (this.elementsContent = [this._Image1_i(), this.labelDisplay_i(), this.iconDisplay_i()]),
                    (this.states = [
                        new eui.State('up', []),
                        new eui.State('down', [new eui.SetProperty('_Image1', 'source', 'button_down_png')]),
                        new eui.State('disabled', [new eui.SetProperty('_Image1', 'alpha', 0.5)]),
                    ]);
            }
            __extends(t, e);
            var n = t.prototype;
            return (
                (n._Image1_i = function () {
                    var e = new eui.Image();
                    return (
                        (this._Image1 = e),
                        (e.percentHeight = 100),
                        (e.scale9Grid = new egret.Rectangle(1, 3, 8, 8)),
                        (e.source = 'button_up_png'),
                        (e.percentWidth = 100),
                        e
                    );
                }),
                (n.labelDisplay_i = function () {
                    var e = new eui.Label();
                    return (
                        (this.labelDisplay = e),
                        (e.bottom = 8),
                        (e.left = 8),
                        (e.right = 8),
                        (e.size = 20),
                        (e.textAlign = 'center'),
                        (e.textColor = 16777215),
                        (e.top = 8),
                        (e.verticalAlign = 'middle'),
                        e
                    );
                }),
                (n.iconDisplay_i = function () {
                    var e = new eui.Image();
                    return (this.iconDisplay = e), (e.horizontalCenter = 0), (e.verticalCenter = 0), e;
                }),
                t
            );
        })(eui.Skin)),
    (generateEUI.paths['resource/eui_skins/CheckBoxSkin.exml'] = window.skins.CheckBoxSkin =
        (function (e) {
            function t() {
                e.call(this),
                    (this.skinParts = ['labelDisplay']),
                    (this.elementsContent = [this._Group1_i()]),
                    (this.states = [
                        new eui.State('up', []),
                        new eui.State('down', [new eui.SetProperty('_Image1', 'alpha', 0.7)]),
                        new eui.State('disabled', [new eui.SetProperty('_Image1', 'alpha', 0.5)]),
                        new eui.State('upAndSelected', [
                            new eui.SetProperty('_Image1', 'source', 'checkbox_select_up_png'),
                        ]),
                        new eui.State('downAndSelected', [
                            new eui.SetProperty('_Image1', 'source', 'checkbox_select_down_png'),
                        ]),
                        new eui.State('disabledAndSelected', [
                            new eui.SetProperty('_Image1', 'source', 'checkbox_select_disabled_png'),
                        ]),
                    ]);
            }
            __extends(t, e);
            var n = t.prototype;
            return (
                (n._Group1_i = function () {
                    var e = new eui.Group();
                    return (
                        (e.percentHeight = 100),
                        (e.percentWidth = 100),
                        (e.layout = this._HorizontalLayout1_i()),
                        (e.elementsContent = [this._Image1_i(), this.labelDisplay_i()]),
                        e
                    );
                }),
                (n._HorizontalLayout1_i = function () {
                    var e = new eui.HorizontalLayout();
                    return (e.verticalAlign = 'middle'), e;
                }),
                (n._Image1_i = function () {
                    var e = new eui.Image();
                    return (
                        (this._Image1 = e),
                        (e.alpha = 1),
                        (e.fillMode = 'scale'),
                        (e.source = 'checkbox_unselect_png'),
                        e
                    );
                }),
                (n.labelDisplay_i = function () {
                    var e = new eui.Label();
                    return (
                        (this.labelDisplay = e),
                        (e.fontFamily = 'Tahoma'),
                        (e.size = 20),
                        (e.textAlign = 'center'),
                        (e.textColor = 7368816),
                        (e.verticalAlign = 'middle'),
                        e
                    );
                }),
                t
            );
        })(eui.Skin)),
    (generateEUI.paths['resource/eui_skins/HScrollBarSkin.exml'] = window.skins.HScrollBarSkin =
        (function (e) {
            function t() {
                e.call(this),
                    (this.skinParts = ['thumb']),
                    (this.minHeight = 8),
                    (this.minWidth = 20),
                    (this.elementsContent = [this.thumb_i()]);
            }
            __extends(t, e);
            var n = t.prototype;
            return (
                (n.thumb_i = function () {
                    var e = new eui.Image();
                    return (
                        (this.thumb = e),
                        (e.height = 8),
                        (e.scale9Grid = new egret.Rectangle(3, 3, 2, 2)),
                        (e.source = 'roundthumb_png'),
                        (e.verticalCenter = 0),
                        (e.width = 30),
                        e
                    );
                }),
                t
            );
        })(eui.Skin)),
    (generateEUI.paths['resource/eui_skins/HSliderSkin.exml'] = window.skins.HSliderSkin =
        (function (e) {
            function t() {
                e.call(this),
                    (this.skinParts = ['track', 'thumb']),
                    (this.minHeight = 8),
                    (this.minWidth = 20),
                    (this.elementsContent = [this.track_i(), this.thumb_i()]);
            }
            __extends(t, e);
            var n = t.prototype;
            return (
                (n.track_i = function () {
                    var e = new eui.Image();
                    return (
                        (this.track = e),
                        (e.height = 6),
                        (e.scale9Grid = new egret.Rectangle(1, 1, 4, 4)),
                        (e.source = 'track_sb_png'),
                        (e.verticalCenter = 0),
                        (e.percentWidth = 100),
                        e
                    );
                }),
                (n.thumb_i = function () {
                    var e = new eui.Image();
                    return (this.thumb = e), (e.source = 'thumb_png'), (e.verticalCenter = 0), e;
                }),
                t
            );
        })(eui.Skin)),
    (generateEUI.paths['resource/eui_skins/ItemRendererSkin.exml'] = window.skins.ItemRendererSkin =
        (function (e) {
            function t() {
                e.call(this),
                    (this.skinParts = ['labelDisplay']),
                    (this.minHeight = 50),
                    (this.minWidth = 100),
                    (this.elementsContent = [this._Image1_i(), this.labelDisplay_i()]),
                    (this.states = [
                        new eui.State('up', []),
                        new eui.State('down', [new eui.SetProperty('_Image1', 'source', 'button_down_png')]),
                        new eui.State('disabled', [new eui.SetProperty('_Image1', 'alpha', 0.5)]),
                    ]),
                    eui.Binding.$bindProperties(this, ['hostComponent.data'], [0], this.labelDisplay, 'text');
            }
            __extends(t, e);
            var n = t.prototype;
            return (
                (n._Image1_i = function () {
                    var e = new eui.Image();
                    return (
                        (this._Image1 = e),
                        (e.percentHeight = 100),
                        (e.scale9Grid = new egret.Rectangle(1, 3, 8, 8)),
                        (e.source = 'button_up_png'),
                        (e.percentWidth = 100),
                        e
                    );
                }),
                (n.labelDisplay_i = function () {
                    var e = new eui.Label();
                    return (
                        (this.labelDisplay = e),
                        (e.bottom = 8),
                        (e.fontFamily = 'Tahoma'),
                        (e.left = 8),
                        (e.right = 8),
                        (e.size = 20),
                        (e.textAlign = 'center'),
                        (e.textColor = 16777215),
                        (e.top = 8),
                        (e.verticalAlign = 'middle'),
                        e
                    );
                }),
                t
            );
        })(eui.Skin)),
    (generateEUI.paths['resource/eui_skins/PanelSkin.exml'] = window.skins.PanelSkin =
        (function (e) {
            function t() {
                e.call(this),
                    (this.skinParts = ['titleDisplay', 'moveArea', 'closeButton']),
                    (this.minHeight = 230),
                    (this.minWidth = 450),
                    (this.elementsContent = [this._Image1_i(), this.moveArea_i(), this.closeButton_i()]);
            }
            __extends(t, e);
            var n = t.prototype;
            return (
                (n._Image1_i = function () {
                    var e = new eui.Image();
                    return (
                        (e.bottom = 0),
                        (e.left = 0),
                        (e.right = 0),
                        (e.scale9Grid = new egret.Rectangle(2, 2, 12, 12)),
                        (e.source = 'border_png'),
                        (e.top = 0),
                        e
                    );
                }),
                (n.moveArea_i = function () {
                    var e = new eui.Group();
                    return (
                        (this.moveArea = e),
                        (e.height = 45),
                        (e.left = 0),
                        (e.right = 0),
                        (e.top = 0),
                        (e.elementsContent = [this._Image2_i(), this.titleDisplay_i()]),
                        e
                    );
                }),
                (n._Image2_i = function () {
                    var e = new eui.Image();
                    return (e.bottom = 0), (e.left = 0), (e.right = 0), (e.source = 'header_png'), (e.top = 0), e;
                }),
                (n.titleDisplay_i = function () {
                    var e = new eui.Label();
                    return (
                        (this.titleDisplay = e),
                        (e.fontFamily = 'Tahoma'),
                        (e.left = 15),
                        (e.right = 5),
                        (e.size = 20),
                        (e.textColor = 16777215),
                        (e.verticalCenter = 0),
                        (e.wordWrap = !1),
                        e
                    );
                }),
                (n.closeButton_i = function () {
                    var e = new eui.Button();
                    return (this.closeButton = e), (e.bottom = 5), (e.horizontalCenter = 0), (e.label = 'close'), e;
                }),
                t
            );
        })(eui.Skin)),
    (generateEUI.paths['resource/eui_skins/ProgressBarSkin.exml'] = window.skins.ProgressBarSkin =
        (function (e) {
            function t() {
                e.call(this),
                    (this.skinParts = ['thumb', 'labelDisplay']),
                    (this.minHeight = 18),
                    (this.minWidth = 30),
                    (this.elementsContent = [this._Image1_i(), this.thumb_i(), this.labelDisplay_i()]);
            }
            __extends(t, e);
            var n = t.prototype;
            return (
                (n._Image1_i = function () {
                    var e = new eui.Image();
                    return (
                        (e.percentHeight = 100),
                        (e.scale9Grid = new egret.Rectangle(1, 1, 4, 4)),
                        (e.source = 'track_pb_png'),
                        (e.verticalCenter = 0),
                        (e.percentWidth = 100),
                        e
                    );
                }),
                (n.thumb_i = function () {
                    var e = new eui.Image();
                    return (
                        (this.thumb = e),
                        (e.percentHeight = 100),
                        (e.source = 'thumb_pb_png'),
                        (e.percentWidth = 100),
                        e
                    );
                }),
                (n.labelDisplay_i = function () {
                    var e = new eui.Label();
                    return (
                        (this.labelDisplay = e),
                        (e.fontFamily = 'Tahoma'),
                        (e.horizontalCenter = 0),
                        (e.size = 15),
                        (e.textAlign = 'center'),
                        (e.textColor = 7368816),
                        (e.verticalAlign = 'middle'),
                        (e.verticalCenter = 0),
                        e
                    );
                }),
                t
            );
        })(eui.Skin)),
    (generateEUI.paths['resource/eui_skins/RadioButtonSkin.exml'] = window.skins.RadioButtonSkin =
        (function (e) {
            function t() {
                e.call(this),
                    (this.skinParts = ['labelDisplay']),
                    (this.elementsContent = [this._Group1_i()]),
                    (this.states = [
                        new eui.State('up', []),
                        new eui.State('down', [new eui.SetProperty('_Image1', 'alpha', 0.7)]),
                        new eui.State('disabled', [new eui.SetProperty('_Image1', 'alpha', 0.5)]),
                        new eui.State('upAndSelected', [
                            new eui.SetProperty('_Image1', 'source', 'radiobutton_select_up_png'),
                        ]),
                        new eui.State('downAndSelected', [
                            new eui.SetProperty('_Image1', 'source', 'radiobutton_select_down_png'),
                        ]),
                        new eui.State('disabledAndSelected', [
                            new eui.SetProperty('_Image1', 'source', 'radiobutton_select_disabled_png'),
                        ]),
                    ]);
            }
            __extends(t, e);
            var n = t.prototype;
            return (
                (n._Group1_i = function () {
                    var e = new eui.Group();
                    return (
                        (e.percentHeight = 100),
                        (e.percentWidth = 100),
                        (e.layout = this._HorizontalLayout1_i()),
                        (e.elementsContent = [this._Image1_i(), this.labelDisplay_i()]),
                        e
                    );
                }),
                (n._HorizontalLayout1_i = function () {
                    var e = new eui.HorizontalLayout();
                    return (e.verticalAlign = 'middle'), e;
                }),
                (n._Image1_i = function () {
                    var e = new eui.Image();
                    return (
                        (this._Image1 = e),
                        (e.alpha = 1),
                        (e.fillMode = 'scale'),
                        (e.source = 'radiobutton_unselect_png'),
                        e
                    );
                }),
                (n.labelDisplay_i = function () {
                    var e = new eui.Label();
                    return (
                        (this.labelDisplay = e),
                        (e.fontFamily = 'Tahoma'),
                        (e.size = 20),
                        (e.textAlign = 'center'),
                        (e.textColor = 7368816),
                        (e.verticalAlign = 'middle'),
                        e
                    );
                }),
                t
            );
        })(eui.Skin)),
    (generateEUI.paths['resource/eui_skins/ScrollerSkin.exml'] = window.skins.ScrollerSkin =
        (function (e) {
            function t() {
                e.call(this), (this.skinParts = []), (this.minHeight = 20), (this.minWidth = 20);
            }
            __extends(t, e);
            t.prototype;
            return t;
        })(eui.Skin)),
    (generateEUI.paths['resource/eui_skins/TextInputSkin.exml'] = window.skins.TextInputSkin =
        (function (e) {
            function t() {
                e.call(this),
                    (this.skinParts = ['textDisplay', 'promptDisplay']),
                    (this.minHeight = 40),
                    (this.minWidth = 300),
                    (this.elementsContent = [this._Image1_i(), this._Rect1_i(), this.textDisplay_i()]),
                    this.promptDisplay_i(),
                    (this.states = [
                        new eui.State('normal', []),
                        new eui.State('disabled', [new eui.SetProperty('textDisplay', 'textColor', 16711680)]),
                        new eui.State('normalWithPrompt', [new eui.AddItems('promptDisplay', '', 1, '')]),
                        new eui.State('disabledWithPrompt', [new eui.AddItems('promptDisplay', '', 1, '')]),
                    ]);
            }
            __extends(t, e);
            var n = t.prototype;
            return (
                (n._Image1_i = function () {
                    var e = new eui.Image();
                    return (
                        (e.percentHeight = 100),
                        (e.scale9Grid = new egret.Rectangle(1, 3, 8, 8)),
                        (e.source = 'button_up_png'),
                        (e.percentWidth = 100),
                        e
                    );
                }),
                (n._Rect1_i = function () {
                    var e = new eui.Rect();
                    return (e.fillColor = 16777215), (e.percentHeight = 100), (e.percentWidth = 100), e;
                }),
                (n.textDisplay_i = function () {
                    var e = new eui.EditableText();
                    return (
                        (this.textDisplay = e),
                        (e.height = 24),
                        (e.left = '10'),
                        (e.right = '10'),
                        (e.size = 20),
                        (e.textColor = 0),
                        (e.verticalCenter = '0'),
                        (e.percentWidth = 100),
                        e
                    );
                }),
                (n.promptDisplay_i = function () {
                    var e = new eui.Label();
                    return (
                        (this.promptDisplay = e),
                        (e.height = 24),
                        (e.left = 10),
                        (e.right = 10),
                        (e.size = 20),
                        (e.textColor = 11119017),
                        (e.touchEnabled = !1),
                        (e.verticalCenter = 0),
                        (e.percentWidth = 100),
                        e
                    );
                }),
                t
            );
        })(eui.Skin)),
    (generateEUI.paths['resource/eui_skins/ToggleSwitchSkin.exml'] = window.skins.ToggleSwitchSkin =
        (function (e) {
            function t() {
                e.call(this),
                    (this.skinParts = []),
                    (this.elementsContent = [this._Image1_i(), this._Image2_i()]),
                    (this.states = [
                        new eui.State('up', [new eui.SetProperty('_Image1', 'source', 'off_png')]),
                        new eui.State('down', [new eui.SetProperty('_Image1', 'source', 'off_png')]),
                        new eui.State('disabled', [new eui.SetProperty('_Image1', 'source', 'off_png')]),
                        new eui.State('upAndSelected', [new eui.SetProperty('_Image2', 'horizontalCenter', 18)]),
                        new eui.State('downAndSelected', [new eui.SetProperty('_Image2', 'horizontalCenter', 18)]),
                        new eui.State('disabledAndSelected', [new eui.SetProperty('_Image2', 'horizontalCenter', 18)]),
                    ]);
            }
            __extends(t, e);
            var n = t.prototype;
            return (
                (n._Image1_i = function () {
                    var e = new eui.Image();
                    return (this._Image1 = e), (e.source = 'on_png'), e;
                }),
                (n._Image2_i = function () {
                    var e = new eui.Image();
                    return (
                        (this._Image2 = e),
                        (e.horizontalCenter = -18),
                        (e.source = 'handle_png'),
                        (e.verticalCenter = 0),
                        e
                    );
                }),
                t
            );
        })(eui.Skin)),
    (generateEUI.paths['resource/eui_skins/VScrollBarSkin.exml'] = window.skins.VScrollBarSkin =
        (function (e) {
            function t() {
                e.call(this),
                    (this.skinParts = ['thumb']),
                    (this.minHeight = 20),
                    (this.minWidth = 8),
                    (this.elementsContent = [this.thumb_i()]);
            }
            __extends(t, e);
            var n = t.prototype;
            return (
                (n.thumb_i = function () {
                    var e = new eui.Image();
                    return (
                        (this.thumb = e),
                        (e.height = 30),
                        (e.horizontalCenter = 0),
                        (e.scale9Grid = new egret.Rectangle(3, 3, 2, 2)),
                        (e.source = 'roundthumb_png'),
                        (e.width = 8),
                        e
                    );
                }),
                t
            );
        })(eui.Skin)),
    (generateEUI.paths['resource/eui_skins/VSliderSkin.exml'] = window.skins.VSliderSkin =
        (function (e) {
            function t() {
                e.call(this),
                    (this.skinParts = ['track', 'thumb']),
                    (this.minHeight = 30),
                    (this.minWidth = 25),
                    (this.elementsContent = [this.track_i(), this.thumb_i()]);
            }
            __extends(t, e);
            var n = t.prototype;
            return (
                (n.track_i = function () {
                    var e = new eui.Image();
                    return (
                        (this.track = e),
                        (e.percentHeight = 100),
                        (e.horizontalCenter = 0),
                        (e.scale9Grid = new egret.Rectangle(1, 1, 4, 4)),
                        (e.source = 'track_png'),
                        (e.width = 7),
                        e
                    );
                }),
                (n.thumb_i = function () {
                    var e = new eui.Image();
                    return (this.thumb = e), (e.horizontalCenter = 0), (e.source = 'thumb_png'), e;
                }),
                t
            );
        })(eui.Skin));
