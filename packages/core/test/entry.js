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

const coreLoader = new core.CoreLoader('seerh5_load');
await coreLoader.load();

window.sea = { ...window.sea, ...core };
