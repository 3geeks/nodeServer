#!/bin/sh

sudo yum install nodejs
sudo npm install -g pm2
sudo npm install -g bower
npm install
bower install
pm2 kill
pm2 start pm2.json