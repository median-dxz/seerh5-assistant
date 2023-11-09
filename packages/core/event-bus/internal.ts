import { Hook } from '../constant/index.js';

import { GameModuleListener } from './module.js';

import { SAEventTarget } from '../common/utils.js';
import { SocketListener } from './socket.js';

export default () => {
    SAEventTarget.on(Hook.Module.loadScript, (name) => {
        GameModuleListener.emit(name, 'load');
    });

    SAEventTarget.on(Hook.Module.construct, (name) => {
        GameModuleListener.emit(name, 'show');
    });

    SAEventTarget.on(Hook.Module.openMainPanel, ({ module }) => {
        GameModuleListener.emit(module, 'mainPanel');
    });

    SAEventTarget.on(Hook.Module.destroy, (name) => {
        GameModuleListener.emit(name, 'destroy');
    });

    SAEventTarget.on(Hook.Socket.send, ({ cmd, data }) => {
        SocketListener.onReq(cmd, data);
    });

    SAEventTarget.on(Hook.Socket.receive, ({ cmd, buffer }) => {
        SocketListener.onRes(cmd, buffer);
    });
};
