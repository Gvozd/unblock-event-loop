import { EventEmitter } from 'node:events';
import AsyncQueue from './AsyncQueue.ts';

export default class UnblockEventLoop extends EventEmitter {
  private readonly queue: AsyncQueue<(data: undefined) => void, void>;

  private start: number | null = null;

  private timer: Promise<void> | null = null;

  public constructor(private readonly threshold: number = 0.1) {
    super();
    this.queue = new AsyncQueue(this.queueExecutor);
  }

  public unblock = (): Promise<void> => new Promise((resolve) => {
    void this.queue.push(resolve);
  });

  private readonly queueExecutor = async (next: (data: undefined) => void): Promise<void> => {
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
    if (this.start === null) {
      this.start = performance.now();
    }

    next(undefined);

    // already in microtasks, guarantee by AsyncQueue~push
    // it allows you to wait for end of microtasks by process.nextTick
    // await new Promise((resolve) => { process.nextTick(resolve); });
    await Promise.resolve();

    const end = performance.now();
    if (end - this.start > this.threshold) {
      await this.timer;
    }
  };
}
