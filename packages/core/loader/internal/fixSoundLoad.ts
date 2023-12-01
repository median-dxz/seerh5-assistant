import { hookPrototype } from '../../common/utils.js';

export function fixSoundLoad() {
    hookPrototype(WebSoundManager, 'loadFightMusic', function (f, url) {
        url = SeerVersionController.getVersionUrl(url);
        return f.call(this, url);
    });
    hookPrototype(WebSoundManager, 'loadSound', function (f, url) {
        url = SeerVersionController.getVersionUrl(url);
        return f.call(this, url);
    });
}
