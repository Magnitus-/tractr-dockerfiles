#dockerfile: letsencrypt

## Overview

This script is meant to run the letsencrypt client as a composable background daemon in webroot mode.

## Status

Beta. Functional so far.

## Usage

1. Customize one of the docker-compose files to suit your needs. See "Customizations" and "Docker-Compose Files". To keep instructions succint, I'll assume docker-compose.yml is used.
2. Ensure you have a reverse-proxy image ready that meets the following criteria (see reverse-proxy directiory for a functioning implementation):
  - Use the "letsencrypt_certificates:/etc/letsencrypt/live" volume as its certificates directory.
  - Maps requests of the ```/.well-known/acme-challenge/{path*}``` variety to the letsencrypt-server container on port 8080
  - Has a ```POST /certificates/reloading``` route that is accessible only by other local docker containers and which, when called, reload certificates (probably by rebooting)
3. Add the reverse-proxy configuration to the docker-compose file (see reverse-proxy directiory for a functioning implementation)
4. Run docker-compose up -f <YourDockerComposeFile> up -d

## Customizations

- DOMAIN: The domain you want to certify. You can specify several domains, by separating them with ';'
- EXECUTION_DELAY: Delay between checks for renewal (in days) when the script is running in daemon mode.
- RENEWAL_DELAY: Minimum lenght of time (in days), between certification renewals. If the script is executed and this amount of time has not elapsed since the last renewal, certificate renewal won't be triggered.
- DAEMON_MODE: If set to 'yes', the script will keep running in the background, triggered checks for renewal after a number of days specified by EXECUTION_DELAY have elapsed. If set to 'no', the script will only check for renewal once and exit.
- reverse-proxy (extra_hosts): IP of the reverse-proxy that will be notified of certificate renewals.

## Docker-Compose Files

There are 3 docker-compose files included with this project.

- docker-compose-dev.yml: Compose file used in development. Builds the images directly on the machine.
- docker-compose.yml: Compose file used for renew-and-exit usage in production. Can be combined with cron and other schedulers to provide automated renewal recurrence.
- docker-compose-daemon.yml: Compose file used to execute the client as a daemon in production. The container will manage automated renewal reccurence.

## TODO

- Improve certificates/keys folder structure
- Make location of the webroot directory composable in client so that it can more easily be used with an existing existing production server
- Add option to make alert action upon certificate renewal composable with a script
- Add doc to run script in cron or with existing production server

## Notes

I went with the acme-tiny client instead of the official letsencrypt client.

Trying to run the official client as non-root in a container felt like pulling teeth.

It was way easier to go from the more minimal acme-tiny client and add the extra features I needed on top.
