#!/usr/bin/env bash

CALACADEMY_DIR="displays.calacademy.org"
CALACADEMY_ENVIRONMENT=$(/opt/elasticbeanstalk/bin/get-config container | /usr/bin/jq -r .environment_name)

if [ "$CALACADEMY_ENVIRONMENT" == "calacademy-displays-stg" ];
then
  CALACADEMY_DIR="displays-stg.calacademy.org"
fi

if [ "$CALACADEMY_ENVIRONMENT" == "calacademy-displays-dev" ];
then
  CALACADEMY_DIR="displays-dev.calacademy.org"
fi

# customize the Message of the Day
if [ ! -f /etc/motd.tail ];
then
  welcomeMsg=$'\n---\nCalifornia Academy of Sciences\n'
  welcomeMsg+=$CALACADEMY_DIR
  welcomeMsg+=$'\n'

  echo "$welcomeMsg" > /etc/motd.tail
  /usr/sbin/update-motd
fi

ln -s /efs/$CALACADEMY_DIR/tmp /tmp-drupal
ln -s /efs/$CALACADEMY_DIR/robots.txt /var/www/html/robots.txt
ln -s /efs/$CALACADEMY_DIR/settings.php /var/www/html/sites/default/settings.php
ln -s /efs/$CALACADEMY_DIR/files /var/www/html/sites/default/files

sudo chown -R webapp:webapp /efs/$CALACADEMY_DIR/files
sudo chown -R webapp:webapp /efs/$CALACADEMY_DIR/tmp
