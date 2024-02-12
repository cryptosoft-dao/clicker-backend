FROM node:20-alpine

ENV NODE_ENV development

##
# Prepare system dependencies
##

RUN apk add --no-cache bash ca-certificates git python3 libpq-dev && \
    adduser -h /home/app -u 101 -D app

##
# Build app
##
USER root
WORKDIR /app

COPY ./dist/apps/backend .
COPY ./package.json ./package-lock.json ./
RUN npm install --frozen-lockfile
RUN chown 101:101 -R /app && \
    rm -rf /root/.npm

##
# Prepare for execution
##

USER 101
ENV PORT=3333
EXPOSE 3333/tcp

CMD node ./main.js