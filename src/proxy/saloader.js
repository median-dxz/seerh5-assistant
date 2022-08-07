import { ModuleListener } from './modulelistener.js';

let sa_init = async () => {
    ModuleListener.install();

    LoginService.loginCompleted = function () {
        RES.removeEventListener(RES.ResourceEvent.GROUP_PROGRESS, this.onResourceProgress, this),
            EventManager.dispatchEventWith('LoginCompeted'),
            window.hideSerialID && window.hideSerialID();
        window.dispatchEvent(new CustomEvent('seerh5_login_completed'));
    };

    const filterLogText = [
        /=.*?lifecycle.on.*=.*?$/,
        /^.*?Music position.*?[0-9]*$/,
        /sound length.*?[0-9]*$/,
        /module width.*?[0-9]*$/,
        /infos=*?>/,
        /^petbag constructor$/,
        /加载cjs 动画preview.*$/,
    ];

    const filterWarnText = [
        /开始执行战斗动画/,
        /=.*?onUseSkill=.*=/,
        />.*?>面板.*?还没有.*$/,
        /js文件>.*已经加载到内存中$/,
    ];

    console.log = new Proxy(console.log, {
        apply: function (target, _this, args) {
            if (args.every((v) => typeof v === 'string')) {
                args = args.filter((v) => !filterLogText.some((reg) => v.match(reg)));
                target(...args);
            } else {
                target(...args);
            }
        },
    });

    console.warn = new Proxy(console.warn, {
        apply: function (target, _this, args) {
            if (args.every((v) => typeof v === 'string')) {
                args = args.filter((v) => !filterWarnText.some((reg) => v.match(reg)));
                target(...args);
            } else {
                target(...args);
            }
        },
    });

    window.Alarm.show = function (t, n) {
        console.log(`[SAHelper]: 接管确认信息: ${t}`);
        BubblerManager.getInstance().showText(t);
        n && n();
    };

    SocketEncryptImpl.prototype.log = function (n, ...e) {
        const logInfo = e.join(' ').replace(/Socket\[[.0-9].*?\]/, '');
        if (this._isShowLog) {
            this.openIDs
                ? this.openIDs.indexOf(n) >= 0 && console.log(logInfo)
                : this.closeIDs.indexOf(n) < 0 && console.log(logInfo);
        }
    };

    SocketEncryptImpl.prototype.send = function (e, n) {
        if (this.connected) {
            var r = this.pack(this.userID, e, n);
            r.position = 0;
            this.writeBytes(r);
            this.flush();
            this.sendDataError(e);
            this.log(
                e,
                '>>Socket[' + this.ip + ':' + this.port.toString() + '][cmdID:' + e + ']',
                SocketEncryptImpl.getCmdLabel(e),
                '[data length:' + this._sendBodyLen + ']'
            );
            return this._result;
        }
        return 0;
    };

    SocketEncryptImpl.prototype.parseData = function (e) {
        this._packageLen = e.readUnsignedInt();
        if (this._packageLen < SocketEncryptImpl.HEAD_LENGTH || this._packageLen > SocketEncryptImpl.PACKAGE_MAX) {
            this.readDataError(0);
            this.dispatchEvent(new SocketErrorEvent(SocketErrorEvent.ERROR, null));
            e.readBytes(new egret.ByteArray());
            return;
        }
        this._headInfo = new HeadInfo(e);
        (1001 == this._headInfo.cmdID || 42387 == this._headInfo.cmdID) && (this._result = this._headInfo.result);

        this.log(
            this._headInfo.cmdID,
            '<<Socket[' + this.ip + ':' + this.port.toString() + '][cmdID:' + this._headInfo.cmdID + ']',
            SocketEncryptImpl.getCmdLabel(this._headInfo.cmdID) + '[paclen:' + this._packageLen + ']'
        );
        if (this._headInfo.result > 1e3) {
            this.log('异常错误:' + this._headInfo.result);
            ParseSocketError.parse(this._headInfo.result, this._headInfo.cmdID);
            this.readDataError(this._headInfo.cmdID);
            this.dispatchError(this._headInfo.cmdID, this._headInfo);
            this.dispatchEvent(new SocketErrorEvent(SocketErrorEvent.ERROR, this._headInfo));
            return;
        }
        if (((this._dataLen = this._packageLen - SocketEncryptImpl.HEAD_LENGTH), 0 == this._dataLen)) {
            this.log(
                this._headInfo.cmdID,
                '<<Socket[' + this.ip + ':' + this.port.toString() + '][cmdID:' + this._headInfo.cmdID + '无包体]',
                SocketEncryptImpl.getCmdLabel(this._headInfo.cmdID)
            );
            this.readDataError(this._headInfo.cmdID);
            this.dispatchCmd(this._headInfo.cmdID, this._headInfo, null);
        } else {
            var r = new egret.ByteArray();
            e.readBytes(r, 0, this._dataLen);
            this.readDataError(this._headInfo.cmdID);
            this.dispatchCmd(this._headInfo.cmdID, this._headInfo, r);
        }
    };
};

let sa_core_init = async () => {
    await import(/* webpackChunkName: "core" */ './core.js');

    await PetStorage2015InfoManager.getTotalInfo(() => {});
    SocketConnection.mainSocket.port = SocketConnection.mainSocket.port.toString().replaceAll('\n', '');
    // SocketConnection.mainSocket.filterCMDLog(1001, 1002, 1016, 2001, 2002, 2441, 9019, 41228, 42387);

    window.dispatchEvent(new CustomEvent('core_ready'));
    import('./modloader.js');
};

window.addEventListener('seerh5_assisant_load', sa_init, { once: true });
window.addEventListener('seerh5_login_completed', sa_core_init, { once: true });
