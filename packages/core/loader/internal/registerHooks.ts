/* eslint-disable @typescript-eslint/unbound-method */
import { filter, map } from 'rxjs';
import { delay, hookFn, hookPrototype, restoreHookedFn, wrapper, type withClass } from '../../common/utils.js';
import { Hook } from '../../constant/index.js';
import { HookRegistry } from '../../event-source/index.js';
import { $hook } from '../../event-source/source-builder/fromHook.js';

export default () => {
    HookRegistry.register(Hook.Module.loadScript, (resolve) => {
        ModuleManager.loadScript = wrapper(ModuleManager.loadScript).after((_, script) => {
            resolve(script);
        });
        return () => void restoreHookedFn(ModuleManager, 'loadScript');
    });

    HookRegistry.register(Hook.Module.openMainPanel, (resolve) => {
        const originalFn = BasicMultPanelModule.prototype.onShowMainPanel;
        BasicMultPanelModule.prototype.onShowMainPanel = async function () {
            await this.openPanel(this._mainPanelName);
            resolve({ module: this.moduleName, panel: this._mainPanelName });
        };
        return () => (BasicMultPanelModule.prototype.onShowMainPanel = originalFn);
    });

    HookRegistry.register(Hook.Module.show, (resolve) => {
        ModuleManager.beginShow = wrapper(ModuleManager.beginShow).after((_r, module, _1, _2, _3, _4, config) => {
            const currModule = ModuleManager.currModule as withClass<BaseModule>;
            if (config) {
                const { id } = config as { id: number; moduleName: string };
                resolve({ module, id, moduleInstance: currModule });
            } else {
                resolve({ module, moduleInstance: currModule });
            }
        });
        return () => restoreHookedFn(ModuleManager, 'beginShow');
    });

    HookRegistry.register(Hook.Battle.endPropShown, (resolve) => {
        const subscription = $hook(Hook.Module.show)
            .pipe(
                filter(({ module }) => module === 'battleResultPanel'),
                filter(
                    ({ moduleInstance: { __class__ } }) =>
                        'battleResultPanel.BattleFailPanel' === __class__ ||
                        'battleResultPanel.BattleResultPanel' === __class__
                ),
                map(() => void null)
            )
            .subscribe(resolve);
        return () => subscription.unsubscribe();
    });

    HookRegistry.register(Hook.Module.destroy, (resolve) => {
        const originalFn = ModuleManager.removeModuleInstance;
        ModuleManager.removeModuleInstance = function (module) {
            const key = Object.keys(this._modules).find((key) => this._modules[key] === module);
            if (key) {
                resolve(module.moduleName);
                const config = module.getModuleConfig();
                this._addModuleToFreeRes(module.moduleName, module.resList, module.resEffectList, config);
                delete this._modules[key];
            }
        };
        return () => (ModuleManager.removeModuleInstance = originalFn);
    });

    HookRegistry.register(Hook.PopView.open, (resolve) => {
        PopViewManager.prototype.openView = wrapper(PopViewManager.prototype.openView).after((r, view) => {
            resolve((Object.getPrototypeOf(view) as withClass<PopView>).__class__);
        });
        return () => restoreHookedFn(PopViewManager.prototype, 'openView');
    });

    HookRegistry.register(Hook.PopView.close, (resolve) => {
        PopViewManager.prototype.hideView = wrapper(PopViewManager.prototype.hideView).after(function (
            this: PopViewManager,
            _,
            id
        ) {
            if (typeof id !== 'number') {
                id = id.hashCode;
            }
            const popView = this.__viewMap__['key_' + id];
            if (popView) {
                resolve((Object.getPrototypeOf(popView) as withClass<PopView>).__class__);
            }
        });
        hookPrototype(PopViewManager, 'hideView', function (originalFunc, id, ...args) {
            originalFunc(id, ...args);
        });
        return () => restoreHookedFn(PopViewManager.prototype, 'hideView');
    });

    HookRegistry.register(Hook.Award.show, (resolve) => {
        hookPrototype(AwardItemDialog, 'startEvent', async function (originalFunc, ...args) {
            originalFunc.apply(this, args);
            resolve();
            LevelManager.stage.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.startRemoveDialog, this);
            await delay(500);
            this.destroy();
        });
        return () => restoreHookedFn(AwardItemDialog.prototype, 'startEvent');
    });

    HookRegistry.register(Hook.Award.receive, (resolve) => {
        AwardManager.showDialog = wrapper(AwardManager.showDialog).after((_, _dialog, items) => {
            resolve({ items });
        });
        return () => restoreHookedFn(AwardManager, 'showDialog');
    });

    HookRegistry.register(Hook.Battle.roundEnd, (resolve) => {
        hookFn(PetFightController, 'onStartFight', function (originalFunc, ...args) {
            originalFunc(...args);
            const { enemyMode, playerMode } = FighterModelFactory;
            if (!enemyMode || !playerMode) return;
            // todo: move this to launcher/feature
            enemyMode.setHpView(true);
            enemyMode.setHpView = function () {
                this.propView.isShowFtHp = true;
            };
            playerMode.nextRound = wrapper(playerMode.nextRound.bind(playerMode)).after(resolve);
        });
        return () => restoreHookedFn(PetFightController, 'onStartFight');
    });

    HookRegistry.register(Hook.Battle.battleStart, (resolve) => {
        // 因为这个Socket监听注册发生在Battle模块初始化的时候, 在这边Hook会滞后, 要重新注册
        SocketConnection.removeCmdListener(
            CommandID.NOTE_START_FIGHT,
            FightNoteCmdListener.startFight,
            FightNoteCmdListener
        );
        FightNoteCmdListener.startFight = wrapper(FightNoteCmdListener.startFight).after(resolve);
        SocketConnection.addCmdListener(
            CommandID.NOTE_START_FIGHT,
            FightNoteCmdListener.startFight,
            FightNoteCmdListener
        );

        return () => {
            SocketConnection.removeCmdListener(
                CommandID.NOTE_START_FIGHT,
                FightNoteCmdListener.startFight,
                FightNoteCmdListener
            );
            restoreHookedFn(FightNoteCmdListener, 'startFight');
            SocketConnection.addCmdListener(
                CommandID.NOTE_START_FIGHT,
                FightNoteCmdListener.startFight,
                FightNoteCmdListener
            );
        };
    });

    HookRegistry.register(Hook.Battle.battleEnd, (resolve) => {
        EventManager.addEventListener(PetFightEvent.ALARM_CLICK, resolve, null);
        return () => EventManager.removeEventListener(PetFightEvent.ALARM_CLICK, resolve, null);
    });

    HookRegistry.register(Hook.Socket.send, (resolve) => {
        SocketConnection.mainSocket.send = wrapper(SocketConnection.mainSocket.send).before((cmd, data) => {
            resolve({ cmd, data });
        });
        return () => restoreHookedFn(SocketConnection.mainSocket, 'send');
    });

    HookRegistry.register(Hook.Socket.receive, (resolve) => {
        SocketConnection.mainSocket.dispatchCmd = wrapper(SocketConnection.mainSocket.dispatchCmd).before(
            (cmd, head, buffer) => {
                resolve({ cmd, buffer });
            }
        );
        return () => restoreHookedFn(SocketConnection.mainSocket, 'dispatchCmd');
    });
};
