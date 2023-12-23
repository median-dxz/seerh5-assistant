import { event$ } from '../common/log.js';
import type { AnyFunction } from '../common/utils.js';
import { SEAEventSource } from '../event-source/index.js';
import { coreSetup, coreSetupBasic } from './features/index.js';

const VERSION = '1.0.0-rc.1';
const SEER_READY_EVENT = 'seerh5_ready';

interface SetupFn {
    type: 'beforeGameCoreInit' | 'afterFirstShowMainPanel';
    fn: AnyFunction;
}

const checkEnv = () => typeof window !== 'undefined' && window === window.self && typeof window.sea === 'undefined';

export class SEAC {
    readonly version = VERSION;

    private loadCalled: boolean;
    private setupFns: Array<SetupFn> = [];
    private setup(type: SetupFn['type']) {
        this.setupFns
            .filter(({ type: _type }) => _type === type)
            .forEach((i) => {
                i.fn();
            });
    }

    readonly event$ = new SEAEventSource(event$);
    devMode: boolean = false;

    constructor() {
        if (checkEnv()) {
            console.log(`%c[SEAC] Version: %c${VERSION}`, 'color: #ff00ff', 'color: #4527a0');
            this.loadCalled = false;

            window.sea = {
                SEER_READY_EVENT,
                SeerH5Ready: false,
                seac: this,
            };

            this.addSetupFn('beforeGameCoreInit', coreSetupBasic);
            this.addSetupFn('afterFirstShowMainPanel', coreSetup);
        } else {
            if (window.sea !== undefined) {
                throw new Error('There can be only one instance of SEA Core');
            } else {
                throw new Error('Not in browser environment');
            }
        }
    }

    addSetupFn(type: SetupFn['type'], fn: SetupFn['fn']) {
        this.setupFns.push({ type, fn });
    }

    async load() {
        if (this.loadCalled) {
            throw new Error('load() should be called only once');
        }
        this.loadCalled = true;

        const { sea } = window;
        if (sea.SeerH5Ready) {
            throw new Error('load() should be only called before Core.init()');
        }

        return new Promise<void>((resolve) => {
            const beforeGameCoreInit = () => {
                EventManager.addEventListener('event_first_show_main_panel', afterFirstShowMainPanel, null);
                this.setup('beforeGameCoreInit');

                // eslint-disable-next-line
                Core.init();
            };

            const afterFirstShowMainPanel = () => {
                EventManager.removeEventListener('event_first_show_main_panel', afterFirstShowMainPanel, null);
                this.setup('afterFirstShowMainPanel');
                resolve();
                this.setupFns = [];
                this.event$.source$.subscribe(({ module, msg: msg_, level }) => {
                    const msg = `[${module}] ${msg_}`;
                    switch (level) {
                        case 'error':
                            console.error(msg);
                            break;
                        case 'warn':
                            console.warn(msg);
                            break;
                        case 'info':
                            console.info(msg);
                            break;
                        case 'debug':
                            this.devMode && console.debug(msg);
                            break;
                    }
                });
            };

            window.addEventListener(SEER_READY_EVENT, beforeGameCoreInit, { once: true });
        });
    }
}

export type VERSION = typeof VERSION;
export const seac = new SEAC();
