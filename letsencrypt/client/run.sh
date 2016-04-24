#!/bin/bash

#Generate account & domain keys and domain csr. This only needs to be done once...
if [ ! -f /etc/letsencrypt/live/account.key ]; then
    openssl genrsa 4096 > /etc/letsencrypt/live/account.key;
    openssl genrsa 4096 > /etc/letsencrypt/live/domain.key;
    if [[ $DOMAIN == *";"* ]]; then
        #Multiple domains
        IFS=';' read -ra DOMAIN_ARRAY <<< "$DOMAIN";
        for i in "${DOMAIN_ARRAY[@]}"; do
            if [ ! -z "$DNS_ENTRIES" ]; then
                DNS_ENTRIES="${DNS_ENTRIES},";
            else
                DNS_ENTRIES='';
            fi
            DNS_ENTRIES="${DNS_ENTRIES}DNS:${i}";
        done
        openssl req -new -sha256 -key /etc/letsencrypt/live/domain.key -subj "/" -reqexts SAN -config <(cat /etc/ssl/openssl.cnf <(printf "[SAN]\nsubjectAltName=${DNS_ENTRIES}")) > /etc/letsencrypt/live/domain.csr;
    else
        #Single domain
        openssl req -new -sha256 -key /etc/letsencrypt/live/domain.key -subj "/CN=${DOMAIN}" > /etc/letsencrypt/live/domain.csr;
    fi
fi

#If no timestamp for last renewal exists, create one that is already expired
if [ ! -f /etc/letsencrypt/live/timestamp ]; then
    #<joke>As long as the script is not executed back in time, it should be fine...</joke>
    echo "1400000000" > /etc/letsencrypt/live/timestamp;
fi

#Run the certificate signing request check in a loop (if in daemon mode), renewing only if enough time has passed since last check
while true; do
    LAST_UPDATE=`cat /etc/letsencrypt/live/timestamp`;
    CURRENT_TIME=$(date +%s);
    if [ "$(((CURRENT_TIME-LAST_UPDATE)/(24*3600)))" -ge $RENEWAL_DELAY ] ; then
        wget -O - https://letsencrypt.org/certs/lets-encrypt-x3-cross-signed.pem > /etc/letsencrypt/live/intermediate.pem;
        python /opt/acme_tiny.py --account-key /etc/letsencrypt/live/account.key --csr /etc/letsencrypt/live/domain.csr --acme-dir /home/node-app/challenge > /etc/letsencrypt/live/signed.crt;
        cat /etc/letsencrypt/live/signed.crt /etc/letsencrypt/live/intermediate.pem > /etc/letsencrypt/live/chained.pem;
        echo $CURRENT_TIME > /etc/letsencrypt/live/timestamp;
        curl -X POST reverse-proxy:80/certificates/reloading;
    fi
    if [ $DAEMON_MODE != "yes" ]; then
        exit 0;
    fi
    sleep "${EXECUTION_DELAY}d";
done
