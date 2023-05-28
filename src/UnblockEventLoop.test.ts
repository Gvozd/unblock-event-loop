import {UnblockEventLoop} from './UnblockEventLoop';
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
        steps.push('before start');
        const unblockEventLoop = new UnblockEventLoop();
        unblockEventLoop.addListener('loop', () => steps.push('loop'));
        const promises = Array(10).fill(void 0).map(async(el, idx) => {
            steps.push(`beforeLock: ${idx}`);
            await unblockEventLoop.unblock();
            steps.push(`afterLock: ${idx}`);
            var time = performance.now();
            while(performance.now() - time < 1);
            steps.push(`afterExecution: ${idx}`);
            return idx;
        });
        const results = await Promise.all(promises);
        expect(results, 'correct result').toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
        expect(steps, 'execution order').toMatchSnapshot();
        await delay(0);
    });
    it('task asynchronously blocking loop', async () => {
        const steps = [];
        steps.push('before start');
        const unblockEventLoop = new UnblockEventLoop();
        unblockEventLoop.addListener('loop', () => steps.push('loop'));
        const promises = Array(10).fill(void 0).map(async(el, idx) => {
            steps.push(`beforeLock: ${idx}`);
            await unblockEventLoop.unblock();
            steps.push(`afterLock: ${idx}`);
            var time = performance.now()
            while(performance.now() - time < 1) await void 0;
            steps.push(`afterExecution: ${idx}`);
            return idx;
        });
        const results = await Promise.all(promises);
        expect(results, 'correct result').toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
        expect(steps, 'execution order').toMatchSnapshot();
        await delay(0);
    });
    describe('race with external code',  () => {
        it('base', async () => {
            const steps = [];
            steps.push('before start');

            let externalCount = 5;
            const externalEnd = new Promise((resolve) => {
                setImmediate(function externalCode() {
                    steps.push(`external code ${externalCount}`);
                    externalCount--;
                    const time = performance.now()
                    while(performance.now() - time < 1);
                    if (externalCount) {
                        setImmediate(externalCode);
                    } else {
                        resolve(void 0);
                    }
                });
            });

            const unblockEventLoop = new UnblockEventLoop();
            unblockEventLoop.addListener('loop', () => steps.push('loop'));
            steps.push('before unblock #1');
            await unblockEventLoop.unblock();
            steps.push('after unblock #1');

            const time = performance.now()
            while(performance.now() - time < 1);
            steps.push('before unblock #2');
            await unblockEventLoop.unblock();
            steps.push('after unblock #2');

            await externalEnd;

            expect(steps, 'execution order').toMatchSnapshot();
        });
    });
});
