# Dockerfile
FROM node:20

# Create app directory
WORKDIR /usr/src/app

COPY package.json ./package.json
COPY yarn.lock tsconfig.json ./
RUN ls -la /usr/src/app

RUN yarn install --frozen-lockfile

COPY src ./src
RUN yarn build
RUN yarn test

CMD ["node", "dist/main.js"]