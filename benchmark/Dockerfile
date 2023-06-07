FROM node:18

WORKDIR /usr/src/app

# Install app dependencies
RUN npm i -g pnpm@7
COPY package.json pnpm-lock.yaml /usr/src/app/
RUN pnpm install
