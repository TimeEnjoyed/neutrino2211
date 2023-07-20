FROM node:latest

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 3030

# mount /app/plans.json

CMD [ "npm", "run", "start" ]
