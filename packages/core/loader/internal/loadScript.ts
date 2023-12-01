export function loadScript(this: ModuleManager, scriptName: string) {
    return new Promise<void>((resolve) => {
        const url = 'resource/app/' + scriptName + '/' + scriptName + '.js';
        RES.getResByUrl(
            url,
            function (script: string) {
                const o = document.createElement('script');
                o.type = 'text/javascript';
                while (script.startsWith('eval')) {
                    script = eval(script.match(/eval([^)].*)/)![1]) as string;
                }
                script = script.replaceAll(/console\.log/g, 'logFilter');
                script = script.replaceAll(/console\.warn/g, 'warnFilter');
                o.text = `//@ sourceURL=http://seerh5.61.com/${url + '\n'}${script}`;
                document.head.appendChild(o).parentNode!.removeChild(o);
                resolve();
            },
            this,
            'text'
        );
    });
}
