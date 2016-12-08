#!/bin/sh

sudo yum install nodejs
sudo npm install -g pm2
npm install
pm2 start ./bin/www --name RepWar --watch