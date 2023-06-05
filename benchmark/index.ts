/* eslint-disable @typescript-eslint/no-use-before-define, no-await-in-loop */
import cluster from 'node:cluster';
import { createServer, get } from 'node:http';
import process from 'node:process';
import { setTimeout as delay } from 'node:timers/promises';
import assert from 'node:assert';
import { unblock } from '../src/index.ts';

const countOfServers = 3;
const port = 8000;
const requestTime = 0;
const url = `http://127.0.0.1:${port}/`;

if (cluster.isPrimary) {
  console.log(`Primary ${process.pid} is running`);
  for (let i = 0; i < countOfServers; i++) {
    cluster.fork();
  }

  await delay(1e3);
  console.log('base check', await request(url));

  for (let count = 2000; count < 40e3; count += 2000) {
    await test('simple', count, simpleRequest);
    await test('unblocked', count, unblockedRequest);
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

async function test(name, count, executor) {
  const start = performance.now();
  const tasks = Array(count).fill(url).map(executor);
  try {
    await Promise.all(tasks);
  } catch(e) {
    await delay(100);
  }
  console.log(`${name}:${count}: ${Math.round(performance.now() - start) / 1000}s`);
}

async function simpleRequest(testUrl) {
  const result = await request(testUrl);
  assert(result === 'Hello Node.js Server');
}

async function unblockedRequest(testUrl) {
  await unblock();
  const result = await request(testUrl);
  assert(result === 'Hello Node.js Server');
}

async function request(requestUrl) {
  return new Promise((resolve, reject) => {
    const req = get(requestUrl, (resp) => {
      const data = [];
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
