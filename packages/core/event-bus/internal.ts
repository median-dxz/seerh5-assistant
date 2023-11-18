import { Hook } from '../constant/index.js';

import { GameModuleListener } from './module.js';

import { SEAEventTarget } from '../common/utils.js';
import { SocketListener } from './socket.js';

export default () => {
    SEAEventTarget.on(Hook.Module.loadScript, (name) => {
        GameModuleListener.emit(name, 'load');
    });

    SEAEventTarget.on(Hook.Module.construct, (name) => {
        GameModuleListener.emit(name, 'show');
    });

    SEAEventTarget.on(Hook.Module.openMainPanel, ({ module }) => {
        GameModuleListener.emit(module, 'mainPanel');
    });

    SEAEventTarget.on(Hook.Module.destroy, (name) => {
        GameModuleListener.emit(name, 'destroy');
    });

    SEAEventTarget.on(Hook.Socket.send, ({ cmd, data }) => {
        SocketListener.onReq(cmd, data);
    });

    SEAEventTarget.on(Hook.Socket.receive, ({ cmd, buffer }) => {
        SocketListener.onRes(cmd, buffer);
    });
};
