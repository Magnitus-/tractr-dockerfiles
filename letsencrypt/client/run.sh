#!/bin/bash
while true; do
    if [ ! -f /etc/letsencrypt/live/account.key ]; then
        openssl genrsa 4096 > /etc/letsencrypt/live/account.key;
        openssl genrsa 4096 > /etc/letsencrypt/live/domain.key;
        openssl req -new -sha256 -key /etc/letsencrypt/live/domain.key -subj "/CN=${DOMAIN}" > /etc/letsencrypt/live/domain.csr;
    fi
    if [ ! -f /etc/letsencrypt/live/timestamp ]; then
        #<joke>As long as the script is not executed back in time, it should be fine...</joke>
        echo "1400000000" > /etc/letsencrypt/live/timestamp;
    fi
    LAST_UPDATE=`cat /etc/letsencrypt/live/timestamp`;
    CURRENT_TIME=$(date +%s);
    if [ "$(((CURRENT_TIME-LAST_UPDATE)/(24*3600)))" -ge 31 ] ; then
        wget -O - https://letsencrypt.org/certs/lets-encrypt-x3-cross-signed.pem > /etc/letsencrypt/live/intermediate.pem;
        python /opt/acme_tiny.py --account-key /etc/letsencrypt/live/account.key --csr /etc/letsencrypt/live/domain.csr --acme-dir /home/node-app/challenge > /etc/letsencrypt/live/signed.crt;
        cat /etc/letsencrypt/live/signed.crt /etc/letsencrypt/live/intermediate.pem > /etc/letsencrypt/live/chained.pem;
        echo $CURRENT_TIME > /etc/letsencrypt/live/timestamp;
        curl -X POST reverse-proxy:80/certificates/reloading;
    fi
    sleep 1d;
done