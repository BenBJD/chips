FROM node:22-alpine

# Client
WORKDIR /app

COPY package.json .

RUN npm install

RUN npm i -g serve

COPY . .

RUN npm run build -w client

EXPOSE 3000

CMD ["./run.sh" ]