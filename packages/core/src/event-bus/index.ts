import { SocketEventHandler, SocketListener } from './socket';

export * from './module';
export * from './socket';

export class SAEventBus {
    callbacks: CallBack[] = [];

    sac(event: string, callback: CallBack) {
        this.callbacks.push(callback);
    }

    game(event: string, callback: CallBack) {
        this.callbacks.push(callback);
    }

    socket<TCmd extends number>(handler: SocketEventHandler<TCmd>) {
        // this.callbacks.push(callback);
    }

    unmount() {
        this.callbacks = [];
    }
}
