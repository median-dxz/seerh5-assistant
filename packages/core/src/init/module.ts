import { SAEventTarget } from '../common';
import { EVENTS as hook } from '../const';

window.filterLogText = [
    /=.*?lifecycle.on.*=.*?$/,
    /(M|m)usic/,
    /sound length.*?[0-9]*$/,
    /module width.*?[0-9]*$/,
    /=*?this._percent=*/,
    /infos=*?>/,
    /加载cjs 动画preview.*$/,
];

window.filterWarnText = [
    /开始执行战斗动画/,
    /=.*?onUseSkill=.*=/,
    />.*?>面板.*?还没有.*$/,
    /head hit.*?index/,
    /PetID:.*?offsetX:/,
    /head.petInfo:/,
    /battleResultPanel/,
    /GuideManager.isCompleted/,
];

export function initModule() {
    ModuleManager.loadScript = function (scriptName) {
        return new Promise((resolve) => {
            var url = 'resource/app/' + scriptName + '/' + scriptName + '.js';
            RES.getResByUrl(
                url,
                function (script: string) {
                    const o = document.createElement('script');
                    o.type = 'text/javascript';
                    while (script.startsWith('eval')) {
                        script = eval(script.match(/eval([^)].*)/)![1]);
                    }
                    script = script.replaceAll(/console\.log/g, 'logFilter');
                    script = script.replaceAll(/console\.warn/g, 'warnFilter');
                    o.text = `//@ sourceURL=${location.href + url + '\n'}${script}`;
                    document.head.appendChild(o).parentNode!.removeChild(o);
                    SAEventTarget.dispatchEvent(new CustomEvent(hook.Module.loadScript, { detail: scriptName }));
                    resolve();
                },
                this,
                'text'
            );
        });
    };

    UIUtils = null;

    SocketEncryptImpl.prototype.log = function (cmd: number, ...msg: string[]) {
        const logInfo = msg.join(' ').replace(/Socket\[[.0-9].*?\]/, '');
        this.openIDs && this.openIDs.flat();
        if (this._isShowLog) {
            this.openIDs
                ? this.openIDs.includes(cmd) && console.log(logInfo)
                : !this.closeIDs.includes(cmd) && console.log(logInfo);
        }
    };

    // SocketConnection.mainSocket.filterCMDLog(1001, 1002, 1016, 2001, 2002, 2441, 9019, 41228, 42387);
}
