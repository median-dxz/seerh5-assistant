import * as core from '../dist/index.js';

mocha.setup('bdd');

document.querySelector('#test-run').addEventListener('click', () => {
    mocha.run();
});

document.querySelector('#test-page').addEventListener('click', () => {
    const el = document.getElementById('mocha');
    const zIndex = el.style.zIndex;
    el.style.zIndex = Number(zIndex) ? 0 : 1;
});

const coreLoader = new core.CoreLoader();

coreLoader.addSetupFn('beforeGameCoreInit', () => {
    OnlineManager.prototype.setSentryScope = () => {};
    GameInfo.online_gate = GameInfo.online_gate.replace('is_ssl=0', 'is_ssl=1');
    GameInfo.token_url = 'account-co.61.com/v3/token/convert'; // http://account-co.61.com/v3/token/convert
});

await coreLoader.load();

window.sea = { ...window.sea, ...core };
