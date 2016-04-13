#!/usr/bin/env python
# -*- coding: utf-8 -*-
import time
import subprocess
import traceback
import logging

while True:
    #subprocess.check_call(["/opt/letsencrypt/venv/bin/letsencrypt", "certonly", "--test-cert"])
    try:
        ps = subprocess.Popen(('echo', '"A\n"'), stdout=subprocess.PIPE)
        output = subprocess.check_output(("/opt/letsencrypt/venv/bin/letsencrypt", "certonly", "--test-cert"), stdin=ps.stdout)
    except Exception as e:
        logging.error(traceback.format_exc())
    ps.wait()
    time.sleep(86400)