FROM node:carbon-alpine

RUN addgroup -S app && adduser -D -h /home/app -G app app
ENV HOME=/home/app

COPY package.json package-lock.json $HOME/api/

RUN chown -R app:app $HOME/*

ENV NPM_CONFIG_PREFIX=$HOME/.npm-global
ENV PATH=$PATH:$HOME/.npm-global/bin

USER app
RUN mkdir ~/.npm-global
RUN npm install -g nodemon@1.14.11 typescript@2.4.2 ts-node@3.3.0 knex@0.12.9 gulp@3.9.1

WORKDIR $HOME/api

RUN npm install

CMD [ "gulp", "start" ]
