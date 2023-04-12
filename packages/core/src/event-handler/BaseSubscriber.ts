export class BaseSubject<Subscriber> {
    protected subscribers: Set<Subscriber> = new Set();
    attach(subscriber: Subscriber) {
        if (!this.subscribers.has(subscriber)) {
            this.subscribers.add(subscriber);
        }
    }
    detach(subscriber: Subscriber) {
        if (this.subscribers.has(subscriber)) {
            this.subscribers.delete(subscriber);
        }
    }
}
