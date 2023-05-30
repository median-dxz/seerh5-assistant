import { Hook } from '../constant';

import { GameModuleListener } from './module';

import { SAEventTarget, SaModuleLogger, defaultStyle } from '../common';
import { SocketListener } from './socket';

const log = SaModuleLogger('SAHookListener', defaultStyle.core);

export default () => {
    SAEventTarget.on(Hook.Award.receive, (data) => {
        log(`获得物品:`);
        const logStr = data.items.map((v: any) => ItemXMLInfo.getName(v.id) + ' ' + v.count);
        log(logStr.join('\r\n'));
    });

    SAEventTarget.on(Hook.Module.loadScript, (name) => {
        log(`检测到新模块加载: ${name}`);
        GameModuleListener.emit(name, 'load');
    });

    SAEventTarget.on(Hook.Module.construct, (name) => {
        GameModuleListener.emit(name, 'show');
    });

    SAEventTarget.on(Hook.Module.openMainPanel, ({ module, panel }) => {
        log(`${module}创建主面板: ${panel}`);
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
