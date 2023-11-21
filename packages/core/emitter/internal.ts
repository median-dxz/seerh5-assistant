import { Hook } from '../constant/index.js';

import { GameModuleListener } from './module.js';

import { SEAHookEmitter } from '../common/utils.js';
import { SocketEventEmitter } from './socket.js';

export default () => {
    SEAHookEmitter.on(Hook.Module.loadScript, (name) => {
        GameModuleListener.emit(name, 'load');
    });

    SEAHookEmitter.on(Hook.Module.construct, ({ module }) => {
        GameModuleListener.emit(module, 'show');
    });

    SEAHookEmitter.on(Hook.Module.openMainPanel, ({ module }) => {
        GameModuleListener.emit(module, 'mainPanel');
    });

    SEAHookEmitter.on(Hook.Module.destroy, (name) => {
        GameModuleListener.emit(name, 'destroy');
    });

    SEAHookEmitter.on(Hook.Socket.send, ({ cmd, data }) => {
        SocketEventEmitter.dispatchSend(cmd, data);
    });

    SEAHookEmitter.on(Hook.Socket.receive, ({ cmd, buffer }) => {
        SocketEventEmitter.dispatchReceive(cmd, buffer);
    });
};
