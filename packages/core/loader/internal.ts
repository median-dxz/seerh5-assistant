import type { AnyFunction } from '../common/utils.js';
import { NOOP, hookPrototype } from '../common/utils.js';

import initBattle from '../battle/internal.js';
import registerEngine from '../engine/internal/index.js';
import initPet from '../pet-helper/internal.js';
import registerHooks from './registerHooks.js';

export const InternalInitiator = {
    loaders: [] as { loader: AnyFunction;}[],

    push(loader: AnyFunction) {
        this.loaders.push({ loader });
    },

    load() {
        this.loaders.forEach((i) => {
            i.loader();
        });
    },
};

export function enableBasic() {
    OnlineManager.prototype.setSentryScope = NOOP;
    ModuleManager.loadScript = loadScript;
    GameInfo.token_url = 'account-co.61.com/v3/token/convert'; // http://account-co.61.com/v3/token/convert
    fixSoundLoad();

    // eslint-disable-next-line
    Core.init();

    InternalInitiator.push(registerHooks);
    InternalInitiator.push(initPet);
    InternalInitiator.push(initBattle);
    InternalInitiator.push(registerEngine);
    InternalInitiator.push(HelperLoader);
}

function loadScript(this: ModuleManager, scriptName: string) {
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

function fixSoundLoad() {
    hookPrototype(WebSoundManager, 'loadFightMusic', function (f, url) {
        url = SeerVersionController.getVersionUrl(url);
        return f.call(this, url);
    });
    hookPrototype(WebSoundManager, 'loadSound', function (f, url) {
        url = SeerVersionController.getVersionUrl(url);
        return f.call(this, url);
    });
}

/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
function HelperLoader() {
    enableBetterAlarm();
    enableFastStaticAnimation();
}

/** parallel the skill animation in static animation mode */
function enableFastStaticAnimation() {
    DBSkillAnimator.prototype.play = function (_, callback, thisObj) {
        const { skillMC } = DBSkillAnimator;
        PetFightController.mvContainer.addChild(skillMC);
        switch (SkillXMLInfo.getCategory(~~this.skillId)) {
            case 1:
                skillMC.animation.play('wugong', -1);
                skillMC.scaleX > 0 ? (skillMC.x = skillMC.x + 580) : (skillMC.x = skillMC.x - 560);
                break;
            case 2:
                skillMC.animation.play('tegong', -1);
                break;
            default:
                skillMC.animation.play('shuxing', -1), (skillMC.y = skillMC.y + 70);
                break;
        }
        if (FightManager.fightAnimateMode === 1) {
            callback.call(thisObj);
        } else {
            skillMC.once(dragonBones.EventObject.COMPLETE, callback.bind(thisObj), this);
        }
    };

    CardPetAnimator.prototype.playAnimate = function (t, e, i, thisObj) {
        thisObj = thisObj ?? this;
        if (e)
            if (FightManager.fightAnimateMode === 1) e.call(thisObj);
            else egret.setTimeout(e.bind(thisObj), thisObj, 1e3);
        if (this)
            if (FightManager.fightAnimateMode === 1) i.call(thisObj);
            else egret.setTimeout(i.bind(thisObj), thisObj, 2e3);
        this.animate?.parent?.addChild(this.animate);
    };

    hookPrototype(UseSkillController, 'onMovieOver', function (f, ...args) {
        f.apply(this, ...args);
        if (FightManager.fightAnimateMode === 1) {
            this.textTimer && (this.textTimer.delay = 200);
        }
    });

    const _RenewPPEffect = RenewPPEffect;
    (RenewPPEffect as unknown) = function (model: BaseFighterModel, itemId: number) {
        const ins = new _RenewPPEffect(model, itemId);
        if (FightManager.fightAnimateMode === 1) {
            // eslint-disable-next-line @typescript-eslint/unbound-method
            ins.timer?.removeEventListener(egret.TimerEvent.TIMER, ins.closeTxt, ins);
            ins.timer?.stop();
            ins.timer = null;
            EventManager.dispatchEvent(new PetFightEvent(PetFightEvent.ON_USE_PET_ITEM));
        }
        return ins;
    };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const Alarm: any;

/** take over the alarm dialog */
function enableBetterAlarm() {
    Alarm.show = function (text: string, callback: () => void) {
        console.log(`[info] 接管确认信息: ${text}`);
        BubblerManager.getInstance().showText(text, true);
        callback && callback();
    };
}
