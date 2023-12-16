import type { AnyFunction } from '../common/utils.js';
import { coreSetup, coreSetupBasic } from './internal/index.js';

const VERSION = '0.7.10';
const SEER_READY_EVENT = 'seerh5_ready';
export type VERSION = typeof VERSION;

interface SetupFn {
    type: 'beforeGameCoreInit' | 'afterFirstShowMainPanel';
    fn: AnyFunction;
}

class CoreLoader {
    static checkEnv = () =>
        typeof window !== 'undefined' && window === window.self && typeof window.sea === 'undefined';

    static readonly version = VERSION;

    private loadCalled: boolean;
    private setupFns: Array<SetupFn> = [];
    private setup(type: SetupFn['type']) {
        this.setupFns
            .filter(({ type: _type }) => _type === type)
            .forEach((i) => {
                i.fn();
            });
    }

    constructor() {
        if (CoreLoader.checkEnv()) {
            this.loadCalled = false;

            window.sea = {
                SEER_READY_EVENT,
                SeerH5Ready: false,
                CoreInstanceCreated: Object.freeze({ flag: true }),
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
            };

            window.addEventListener(SEER_READY_EVENT, beforeGameCoreInit, { once: true });
        });
    }
}

export { CoreLoader };

