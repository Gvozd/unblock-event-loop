/* eslint-disable @typescript-eslint/no-use-before-define, no-await-in-loop */
import cluster from 'node:cluster';
import { createServer, get } from 'node:http';
import process from 'node:process';
import { setTimeout as delay } from 'node:timers/promises';
import assert from 'node:assert';
import pMap from 'p-map';
import { unblock } from '../src/index.ts';

const countOfServers = 3;
const port = 8000;
const requestTime = 50;
const url = `http://127.0.0.1:${port}/`;
const countOfTasks = 100e3;
const step = 5000;

if (cluster.isPrimary) {
  console.log(`Primary ${process.pid} is running`);
  for (let i = 0; i < countOfServers; i++) {
    cluster.fork();
  }

  await delay(1e3);
  console.log('base check', await request(url));

  for (let concurrency = step; concurrency < 40e3; concurrency += step) {
    await test('simple', countOfTasks, concurrency, simpleRequest);
    await test('unblocked', countOfTasks, concurrency, unblockedRequest);
    await delay(100);
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

async function test(name: string, count: number, concurrency: number, executor: (url: string) => Promise<void>) {
  const tasks = Array(count).fill(url);
  const start = performance.now();
  try {
    await pMap(tasks, executor, {concurrency});
  } catch(e) {
    await delay(100);
  }
  console.log(`${name}:${count}: ${Math.round(performance.now() - start) / 1000}s`);
}

async function simpleRequest(testUrl: string) {
  const result = await request(testUrl);
  assert(result === 'Hello Node.js Server');
}

async function unblockedRequest(testUrl: string) {
  await unblock();
  const result = await request(testUrl);
  assert(result === 'Hello Node.js Server');
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
