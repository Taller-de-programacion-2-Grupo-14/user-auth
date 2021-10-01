#Extracted example from https://nodejs.org/en/docs/guides/nodejs-docker-webapp/
FROM node:14

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install --save --silent #Could be interesting to use npm ci
RUN npm install react-scripts@latest -g --silent
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY . .

EXPOSE 8080
CMD [ "npm", "start" ]