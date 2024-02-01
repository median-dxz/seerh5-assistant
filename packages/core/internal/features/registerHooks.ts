/* eslint-disable @typescript-eslint/unbound-method */
import { filter, map } from 'rxjs';
import { delay, hookFn, hookPrototype, restoreHookedFn, wrapper, type WithClass } from '../../common/utils.js';
import { $hook } from '../../event-source/source-builder/fromHook.js';
import { HookPointRegistry } from '../HookPointRegistry.js';

export default () => {
    HookPointRegistry.register('module:loadScript', (resolve) => {
        ModuleManager.loadScript = wrapper(ModuleManager.loadScript).after((_, script) => {
            resolve(script);
        });
        return () => void restoreHookedFn(ModuleManager, 'loadScript');
    });

    HookPointRegistry.register('module:openMainPanel', (resolve) => {
        hookPrototype(BasicMultPanelModule, 'onShowMainPanel', async function () {
            await this.openPanel(this._mainPanelName);
            resolve({ module: this.moduleName, panel: this._mainPanelName });
        });
        return () => void restoreHookedFn(BasicMultPanelModule.prototype, 'onShowMainPanel');
    });

    HookPointRegistry.register('module:show', (resolve) => {
        ModuleManager.beginShow = wrapper(ModuleManager.beginShow).after((_r, module, _1, _2, _3, _4, config) => {
            const currModule = ModuleManager.currModule as WithClass<BaseModule>;
            if (config) {
                const { id } = config as { id: number; moduleName: string };
                resolve({ module, id, moduleInstance: currModule });
            } else {
                resolve({ module, moduleInstance: currModule });
            }
        });
        return () => void restoreHookedFn(ModuleManager, 'beginShow');
    });

    HookPointRegistry.register('battle:showEndProp', (resolve) => {
        const subscription = $hook('module:show')
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

    HookPointRegistry.register('module:destroy', (resolve) => {
        hookFn(ModuleManager, 'removeModuleInstance', function (_, module) {
            const key = Object.keys(this._modules).find((key) => this._modules[key] === module);
            if (key) {
                resolve(module.moduleName);
                const config = module.getModuleConfig();
                this._addModuleToFreeRes(module.moduleName, module.resList, module.resEffectList, config);
                delete this._modules[key];
            }
        });
        return () => void restoreHookedFn(ModuleManager, 'removeModuleInstance');
    });

    HookPointRegistry.register('pop_view:open', (resolve) => {
        PopViewManager.prototype.openView = wrapper(PopViewManager.prototype.openView).after((r, view) => {
            resolve((Object.getPrototypeOf(view) as WithClass<PopView>).__class__);
        });
        return () => restoreHookedFn(PopViewManager.prototype, 'openView');
    });

    HookPointRegistry.register('pop_view:close', (resolve) => {
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
                resolve((Object.getPrototypeOf(popView) as WithClass<PopView>).__class__);
            }
        });
        return () => restoreHookedFn(PopViewManager.prototype, 'hideView');
    });

    HookPointRegistry.register('award:show', (resolve) => {
        hookPrototype(AwardItemDialog, 'startEvent', async function (originalFunc, ...args) {
            originalFunc.apply(this, args);
            resolve();
            // TODO 副作用移除
            LevelManager.stage.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.startRemoveDialog, this);
            await delay(500);
            this.destroy();
        });
        return () => restoreHookedFn(AwardItemDialog.prototype, 'startEvent');
    });

    HookPointRegistry.register('award:receive', (resolve) => {
        AwardManager.showDialog = wrapper(AwardManager.showDialog).after((_, _dialog, items) => {
            resolve({ items });
        });
        return () => restoreHookedFn(AwardManager, 'showDialog');
    });

    HookPointRegistry.register('battle:roundEnd', (resolve) => {
        hookFn(PetFightController, 'onStartFight', function (originalFunc, ...args) {
            originalFunc(...args);
            const { enemyMode, playerMode } = FighterModelFactory;
            if (!enemyMode || !playerMode) return;
            // TODO 副作用移除
            enemyMode.setHpView(true);
            enemyMode.setHpView = function () {
                this.propView.isShowFtHp = true;
            };
            playerMode.nextRound = wrapper(playerMode.nextRound.bind(playerMode)).after(resolve);
        });
        return () => restoreHookedFn(PetFightController, 'onStartFight');
    });

    HookPointRegistry.register('battle:start', (resolve) => {
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

    HookPointRegistry.register('battle:end', (resolve) => {
        EventManager.addEventListener(PetFightEvent.ALARM_CLICK, resolve, null);
        return () => EventManager.removeEventListener(PetFightEvent.ALARM_CLICK, resolve, null);
    });

    HookPointRegistry.register('socket:send', (resolve) => {
        SocketConnection.mainSocket.send = wrapper(SocketConnection.mainSocket.send).before((cmd, data) => {
            resolve({ cmd, data });
        });
        return () => restoreHookedFn(SocketConnection.mainSocket, 'send');
    });

    HookPointRegistry.register('socket:receive', (resolve) => {
        SocketConnection.mainSocket.dispatchCmd = wrapper(SocketConnection.mainSocket.dispatchCmd).before(
            (cmd, head, buffer) => {
                resolve({ cmd, buffer });
            }
        );
        return () => restoreHookedFn(SocketConnection.mainSocket, 'dispatchCmd');
    });
};
