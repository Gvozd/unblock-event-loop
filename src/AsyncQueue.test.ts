import { setTimeout as delay } from 'timers/promises';
import AsyncQueue from './AsyncQueue';

describe('EventLoopMonitor', () => {
  it('base', async () => {
    const steps = [];
    const queue = new AsyncQueue(async (data: number) => {
      steps.push({ taskStart: data });
      await delay(10);
      steps.push({ taskEnd: data });
      return data * 2;
    });

    steps.push('global start');
    const results = [
      queue.push(1),
      queue.push(2),
    ];
    steps.push('global end of push tasks');
    steps.push({ tasksExecuted: await Promise.all(results) });
    steps.push('global end');
    expect(steps, 'execution order').toMatchSnapshot();
  });
});
