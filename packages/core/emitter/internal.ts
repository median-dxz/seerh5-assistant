import { Hook } from '../constant/index.js';

import { GameModuleListener } from './module.js';

import { SEAHookDispatcher } from '../common/utils.js';
import { SocketEventEmitter } from './socket.js';

export default () => {
    SEAHookDispatcher.on(Hook.Module.loadScript, (name) => {
        GameModuleListener.emit(name, 'load');
    });

    SEAHookDispatcher.on(Hook.Module.construct, ({ module }) => {
        GameModuleListener.emit(module, 'show');
    });

    SEAHookDispatcher.on(Hook.Module.openMainPanel, ({ module }) => {
        GameModuleListener.emit(module, 'mainPanel');
    });

    SEAHookDispatcher.on(Hook.Module.destroy, (name) => {
        GameModuleListener.emit(name, 'destroy');
    });

    SEAHookDispatcher.on(Hook.Socket.send, ({ cmd, data }) => {
        SocketEventEmitter.dispatchSend(cmd, data);
    });

    SEAHookDispatcher.on(Hook.Socket.receive, ({ cmd, buffer }) => {
        SocketEventEmitter.dispatchReceive(cmd, buffer);
    });
};
