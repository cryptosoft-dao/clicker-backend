# builder stage named "deps"
FROM node:20 as deps
RUN apt-get install -y git python3 libpq-dev dumb-init libc6-amd64-cross

RUN ln -s /usr/x86_64-linux-gnu/lib64/ /lib64

ENV LD_LIBRARY_PATH="$LD_LIBRARY_PATH:/lib64:/usr/x86_64-linux-gnu/lib"

WORKDIR /app
COPY ./package*.json .

# install extracted deps
RUN npm install

# install additional deps
RUN npm install reflect-metadata tslib rxjs pg

# runner stage
FROM node:20 as runner
WORKDIR /app
# pull in packages from builder stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./package.json

# copy local, compiled app
COPY dist/apps/backend .
RUN chown -R node:node .
USER node

CMD ["dumb-init", "node", "main.js"]