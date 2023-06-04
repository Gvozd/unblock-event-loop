import { EventEmitter } from 'node:events';
import { AsyncQueue } from './AsyncQueue';

export class UnblockEventLoop extends EventEmitter {
  constructor (private readonly threshold: number = 1) {
    super();
    this.queue = new AsyncQueue(this.queueExecutor);
  }

  unblock = () => {
    return new Promise((resolve) => {
      this.queue.push(resolve);
    });
  };

  private readonly queue: AsyncQueue<(data: void) => void, void>;
  private start: number | null = null;
  private timer: Promise<void> | null = null;

  private readonly queueExecutor = async (next: (data: void) => void) => {
    if (this.timer == null) {
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

    // already in microtasks, guarantee by AsyncQueue~push
    // it allows you to wait for end of microtasks by process.nextTick
    await new Promise(resolve => { process.nextTick(resolve); });

    const end = performance.now();
    if (end - this.start > this.threshold) {
      await this.timer;
    }
  };
}
