import { Hook } from '../constant/index.js';

import { GameModuleEventEmitter } from './GameModule.js';

import { SEAHookEmitter } from '../common/utils.js';
import { SocketEventEmitter } from './socket.js';

export default () => {
    SEAHookEmitter.on(Hook.Module.loadScript, (name) => {
        GameModuleEventEmitter.emit(name, 'load');
    });

    SEAHookEmitter.on(Hook.Module.construct, ({ module }) => {
        GameModuleEventEmitter.emit(module, 'show');
    });

    SEAHookEmitter.on(Hook.Module.openMainPanel, ({ module }) => {
        GameModuleEventEmitter.emit(module, 'mainPanel');
    });

    SEAHookEmitter.on(Hook.Module.destroy, (name) => {
        GameModuleEventEmitter.emit(name, 'destroy');
    });

    SEAHookEmitter.on(Hook.Socket.send, ({ cmd, data }) => {
        SocketEventEmitter.dispatchSend(cmd, data);
    });

    SEAHookEmitter.on(Hook.Socket.receive, ({ cmd, buffer }) => {
        SocketEventEmitter.dispatchReceive(cmd, buffer);
    });
};
