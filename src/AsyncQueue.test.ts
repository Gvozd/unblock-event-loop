import {AsyncQueue} from './AsyncQueue';
import {setTimeout as delay} from 'timers/promises';

describe('EventLoopMonitor', () => {
    const jestConsole = console;
    beforeAll(() => {
        global.console = require('console');
    });
    afterAll(() => {
        global.console = jestConsole;
    });
    it('base', async () => {
        const steps = [];
        var queue = new AsyncQueue(async function(data: number) {
            steps.push({taskStart: data});
            await delay(100);
            steps.push({taskEnd: data});
            return data * 2;
        });

        steps.push('global start');
        var results = [
            queue.push(1),
            queue.push(2),
        ];
        steps.push('global end of push tasks');
        steps.push({tasksExecuted: await Promise.all(results)});
        steps.push('global end');
        expect(steps, 'execution order').toMatchSnapshot();
    });
});
