import { EventEmitter } from 'node:events';
import { AsyncQueue } from './AsyncQueue';

export class UnblockEventLoop extends EventEmitter{
    constructor(private threshold: number = 1) {
        super();
        this.queue = new AsyncQueue(this.queueExecutor);
    }

    unblock = () => {
        return new Promise((resolve) => {
            this.queue.push(resolve);
        });
    }

    private queue: AsyncQueue<(data: void) => void, void>;
    private start: number | null = null;
    private timer: Promise<void> | null = null;

    private queueExecutor = async (next: (data: void) => void) => {
        if (!this.timer) {
            this.timer = new Promise((resolve) => {
                setImmediate(() => {
                    this.emit('loop');
                    this.start = null;
                    this.timer = null;
                    resolve();
                });
            });
        }
        if (!this.start) {
            this.start = performance.now();
        }

        next(void 0);
        await Promise.resolve();

        const end = performance.now();
        if (end - this.start > this.threshold) {
            await this.timer;
        }
    }
}
