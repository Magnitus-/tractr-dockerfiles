#dockerfile: letsencrypt

## Overview

This script is meant to run the letsencrypt client as a composable background daemon in webroot mode.

## Status

Beta. Functional so far.

## Usage

1. Customize the docker-compose.yml file to suit your needs. See "Customizations".
2. Ensure you have a reverse-proxy image ready that can (see reverse proxy example):
  - Link to the letsencrypt-server container
  - Maps requests of the ```/.well-known/acme-challenge/{path*}``` variety to the letsencrypt-server container on port 8080
  - Gets volumes from the letsencrypt-certificates container
  - Gets its certificates from the /etc/letsencrypt/live shared volume
  - Has a ```POST /certificates/reloading``` route that is accessible only by other local docker containers and which, when called, reload certificates (probably by rebooting)
3. From the project's folder, start the certificate container: docker-compose up -d certificates
4. From the project's folder, start the letsencrypt server container: docker-compose up -d server
5. Start your reverse-proxy container
6. From the project's folder, start the letsencrypt client container: docker-compose up -d client

## Customizations

- DOMAIN: The domain you want to certify. You can specify several domains, by separating them with ';'
- EXECUTION_DELAY: Delay between checks for renewal (in days) when the script is running in daemon mode.
- RENEWAL_DELAY: Minimum lenght of time (in days), between certification renewals. If the script is executed and this amount of time has not elapsed since the last renewal, certificate renewal won't be triggered.
- DAEMON_MODE: If set to 'yes', the script will keep running in the background, triggered checks for renewal after a number of days specified by EXECUTION_DELAY have elapsed. If set to 'no', the script will only check for renewal once and exit.
- reverse-proxy (extra_hosts): IP of the reverse-proxy that will be notified of certificate renewals.

## TODO

- Improve certificates/keys folder structure
- Create fixed docker images rather than relying on building the image each time
- Make location of the webroot directory composable in client so that it can more easily be used with an existing existing production server
- Add option to make alert action upon certificate renewal composable with a script
- Add doc to run script in cron or with existing production server

## Notes

I went with the acme-tiny client instead of the official letsencrypt client.

Trying to run the official client as non-root in a container felt like pulling teeth.

It was way easier to go from the more minimal acme-tiny client and add the extra features I needed on top.
