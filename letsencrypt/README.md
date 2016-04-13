#dockerfile: letsencrypt

## Overview

This script is meant to run the letsencrypt client as a composable background daemon in webroot mode.

## Status

Beta. In development.

## Usage

- Edit the client/config.ini file: Change the email and domain entries
- Start: Run the following in the directory containing the docker-compose.yml file: docker-compose up -d
- Stop: Run the following in the directory containing the docker-compose.yml file: docker-compose stop
- Make sure your server container has access to volumes from the letsencrypt-daemon and your server is configured to map files in /var/www/html/letsencrypt/.well-known/acme-challenge/<file> map to url GET /.well-known/acme-challenge/<file>


## TODO

Create data container