import cluster from 'node:cluster';
import { createServer, get } from 'node:http';
import process from 'node:process';
import { setTimeout as delay } from 'node:timers/promises';

const countOfServers = 3;
const port = 8000;
const url = `http://127.0.0.1:${port}/`;

if (cluster.isPrimary) {
  console.log(`Primary ${process.pid} is running`);
  for (let i = 0; i < countOfServers; i++) {
    cluster.fork();
  }
  cluster.on('exit', (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
  });

  await delay(1e3);
  console.log('____', await request(url));

  process.exit(1);
} else {
  createServer((req, res) => {
    res.end('Hello Node.js Server');
  }).listen(port);

  console.log(`Worker ${process.pid} started`);
}

async function test(name, count) {
  const title = `${name}:${count}`;
  console.time(title);
  const tasks = [];
  console.timeEnd(title);
}

async function request(url) {
  return new Promise((resolve, reject) => {
    const request = get(url, (resp) => {
      const data = [];
      resp.on('data', (chunk) => {
        data.push(chunk);
      });
      resp.on('end', () => {
        resolve(data.join(''));
      });
    });
    request.on('error', (err) => {
      reject(err);
    });
  });
}
