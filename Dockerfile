FROM node:8-alpine
COPY ./*.js /remo/
COPY ./model/*.js /remo/model/
COPY package.json /remo
WORKDIR /remo
RUN npm install
RUN npm install -g
