/* eslint-disable @typescript-eslint/no-use-before-define, no-await-in-loop */
import cluster from 'node:cluster';
import { createServer, get } from 'node:http';
import process from 'node:process';
import { setTimeout as delay } from 'node:timers/promises';
import assert from 'node:assert';
import { unblock } from '../src/index.ts';

const countOfServers = 9;
const port = 8000;
const requestTime = 500;
const url = `http://127.0.0.1:${port}/`;
const countOfTasks = 100e3;
const step = 500;

if (cluster.isPrimary) {
  console.log(`Primary ${process.pid} is running`);
  for (let i = 0; i < countOfServers; i++) {
    cluster.fork();
  }

  await delay(1e3);
  console.log('base check', await request(url));

  for (let concurrency = step; concurrency <= 100e3; concurrency += step) {
    // await test('simple', concurrency, simpleRequest);
    await test('unblocked', concurrency, unblockedRequest);
    await delay(1e3);
  }

  process.exit(1);
} else {
  createServer((req, res) => {
    setTimeout(() => {
      res.end('Hello Node.js Server');
    }, requestTime);
  }).listen(port);

  console.log(`Worker ${process.pid} started`);
}

async function test(name, count, executor) {
  const start = performance.now();
  const tasks = Array(count).fill(url).map(executor);
  let stats;
  try {
    stats = await Promise.all(tasks);
  } catch(e) {
    console.log(`____error ${name}:${count}`);
    await delay(1e3);
  }
  console.log(`${name}:${count}: ${Math.round(performance.now() - start) / 1000}s`);
  printRequestsStats(stats);
}

async function simpleRequest(testUrl: string) {
  const result = await request(testUrl);
  assert(result === 'Hello Node.js Server');
}

async function unblockedRequest(testUrl: string) {
  const start = performance.now();
  await unblock();
  const result = await request(testUrl);
  const execTime = performance.now() - start;
  assert(result === 'Hello Node.js Server');
  return { execTime };
}

async function request(requestUrl: string) {
  return new Promise((resolve, reject) => {
    const req = get(requestUrl, (resp) => {
      const data: string[] = [];
      resp.on('data', (chunk) => {
        data.push(chunk);
      });
      resp.on('end', () => {
        resolve(data.join(''));
      });
    });
    req.on('error', (err) => {
      reject(err);
    });
  });
}

function printRequestsStats(stats: Array<Record<string, number>>) {
  const transposedStats = Object.fromEntries(
      Object.keys(stats[0]).map((key) => {
        const timings = stats.reduce((arr, el) => {
          arr.push(el[key]);
          return arr;
        }, [] as number[]);


        const sortedTimings = timings.slice().sort((a, b) => a - b);
        const min = sortedTimings.at(0) as number;
        const max = sortedTimings.at(-1) as number;
        const sum = sortedTimings.reduce((a,b) => a + b, 0);
        const avg = sum / sortedTimings.length;
        const dev = Math.sqrt(
            sortedTimings
                .map(x =>  Math.pow(x - avg, 2))
                .reduce((a,b) => a + b, 0) / sortedTimings.length
        );
        return [key, {
          min: min.toFixed(2),
          max: max.toFixed(2),
          avg: avg.toFixed(2),
          dev: dev.toFixed(2),
        }];
      })
  );
  console.log(transposedStats);
}
