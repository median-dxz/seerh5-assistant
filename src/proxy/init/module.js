export {};
/**
 * @returns {Promise<void>}
 */
 ModuleManager.loadScript = function (scriptName) {
    return new Promise((resolve) => {
        var url = 'resource/app/' + scriptName + '/' + scriptName + '.js';
        RES.getResByUrl(
            url,
            function (script) {
                const o = document.createElement('script');
                o.type = 'text/javascript';
                while (script.startsWith('eval')) {
                    script = eval(script.match(/eval([^)].*)/)[1]);
                }
                script = '//@ sourceURL=' + location.href + url + '\n' + script;
                o.text = script;
                // @ts-ignore
                document.head.appendChild(o).parentNode.removeChild(o);
                resolve();
            },
            this,
            'text'
        );
    });
};