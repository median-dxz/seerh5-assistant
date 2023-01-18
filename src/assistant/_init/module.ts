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
                window.SAEventTarget.dispatchEvent(new CustomEvent(hook.Module.loadScript, { detail: scriptName }));
                resolve();
            },
            this,
            'text'
        );
    });
};

UIUtils = null;

export {};
