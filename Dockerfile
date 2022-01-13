FROM node:16-alpine3.11

WORKDIR /usr/src/app

COPY package*.json ./

RUN yarn install; 
RUN yarn

COPY . .

EXPOSE 3000

CMD [ "yarn", "start" ]