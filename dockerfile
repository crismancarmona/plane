# Dockerfile
FROM node:20

# Create app directory
WORKDIR /usr/src/app

RUN mkdir node_modules
RUN mkdir node_modules/types
COPY package-docker.json ./package.json
COPY yarn.lock tsconfig.json ./
RUN ls -la /usr/src/app

RUN yarn install --frozen-lockfile

COPY node_modules/types ./node_modules/types
COPY src ./src
RUN yarn build

CMD ["node", "dist/main.js"]