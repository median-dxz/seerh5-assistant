import * as lib from '../dist/index.js';

mocha.setup('bdd');

window.wwwroot = '/seerh5.61.com/';

fetch('/seerh5.61.com/app.js?t=' + Date.now())
    .then((res) => res.text())
    .then((appJs) => {
        let script = document.createElement('script');
        while (appJs.startsWith('eval')) {
            appJs = eval(appJs.match(/eval([^)].*)/)[1]);
        }
        script.innerHTML = appJs.replace(/loadSingleScript.*baidu.*\r\n/, '');
        document.body.appendChild(script);
    });

document.querySelector('#test-run').addEventListener('click', () => {
    mocha.run();
});

document.querySelector('#test-page').addEventListener('click', () => {
    const el = document.getElementById('mocha');
    const zIndex = el.style.zIndex;
    el.style.zIndex = Number(zIndex) ? 0 : 1;
});

window.saCore = lib;

await lib.CoreLoader();
