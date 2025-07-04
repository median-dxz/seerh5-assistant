import { Subject } from 'rxjs';

import type { SEACLogEvent } from '../common/logger.js';
import { logEvent$ } from '../common/logger.js';
import type { AnyFunction } from '../common/utils.js';

import initBattle from '../battle/internal.js';
import initPet from '../pet-helper/internal.js';
import registerGameConfig from './setup/registerGameConfig.js';
import registerHooks from './setup/registerHooks.js';

const VERSION = '1.0.3';
const SEER_READY_EVENT = 'seerh5_ready';

export interface SetupOptions {
    type: 'beforeGameCoreInit' | 'afterFirstShowMainPanel';
    setup: AnyFunction | { flag?: unknown; fn: AnyFunction };
}

const checkEnv = () => typeof window !== 'undefined' && window === window.self && typeof window.sea === 'undefined';

export class CoreLoader {
    readonly version = VERSION;

    private loadCalled = false;
    private async setup(type: SetupOptions['type']) {
        for (const i of this.setupFns.filter(({ type: _type }) => _type === type)) {
            if (typeof i.setup === 'function') {
                await i.setup();
            } else if (typeof i.setup === 'object' && i.setup.flag) {
                await i.setup.fn();
            }
        }
    }

    readonly log$ = new Subject<SEACLogEvent>();

    abortGameLoadSignal: undefined | AbortSignal;

    constructor() {
        if (checkEnv()) {
            console.log(`%c[SEAC] Version: %c${VERSION}`, 'color: #ff00ff', 'color: #4527a0');
            window.sea = {
                ...window.sea,
                SEER_READY_EVENT,
                SeerH5Ready: false,
                seac: this
            };

            this.prependSetup('afterFirstShowMainPanel', registerHooks);
            this.prependSetup('afterFirstShowMainPanel', registerGameConfig);
            this.prependSetup('afterFirstShowMainPanel', initPet);
            this.prependSetup('afterFirstShowMainPanel', initBattle);

            logEvent$.subscribe(this.log$);
        } else {
            console.warn(`[SEAC] Check runtime failed. Core will not be loaded.`);
        }
    }

    public setupFns: SetupOptions[] = [];

    prependSetup(type: SetupOptions['type'], fn: SetupOptions['setup']) {
        this.setupFns.push({ type, setup: fn });
    }

    async load() {
        if (this.loadCalled) {
            throw new Error('load() should be called only once');
        }
        this.loadCalled = true;

        const { sea } = window;

        return new Promise<void>((resolve, reject) => {
            const beforeGameCoreInit = async () => {
                await this.setup('beforeGameCoreInit');
                if (this.abortGameLoadSignal?.aborted) {
                    reject(this.abortGameLoadSignal.reason);
                    return;
                }
                EventManager.addEventListener('event_first_show_main_panel', afterFirstShowMainPanel, null);

                // eslint-disable-next-line
                Core.init();
                // eslint-disable-next-line
                Driver.doAction();
            };

            const afterFirstShowMainPanel = async () => {
                EventManager.removeEventListener('event_first_show_main_panel', afterFirstShowMainPanel, null);
                await this.setup('afterFirstShowMainPanel');
                resolve();
                this.setupFns = [];
            };

            if (sea.SeerH5Ready) {
                void beforeGameCoreInit();
            } else {
                window.addEventListener(SEER_READY_EVENT, beforeGameCoreInit, { once: true });
            }
        });
    }
}

export const seac = new CoreLoader();
