FROM node:22

EXPOSE 3000
EXPOSE 8080

WORKDIR /app

COPY package.json /app
COPY package-lock.json /app

RUN npm install

RUN npm i -g serve

COPY . /app

RUN npm run build -w client

ENTRYPOINT ["./run.sh"]