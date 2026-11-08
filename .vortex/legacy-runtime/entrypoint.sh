#!/bin/sh
# Builds the legacy EARs with the legacy Ant build, configures the RI, starts it and deploys.
set -e
cd /petstore/app
mkdir -p lib && cp -r /opt/apache-ant-1.6.5 lib/ant
cloudscape -start > /tmp/cloudscape.log 2>&1 &
sleep 15
sh setup.sh core                                  # JMS destinations, users, databases
j2ee -verbose > /tmp/j2ee.log 2>&1 &
until curl -fs http://localhost:8000/ > /dev/null 2>&1; do sleep 5; done
sh setup.sh deploy                                # builds and deploys petstore, opc, supplier, admin
curl -fs "http://localhost:8000/petstore/Populate?forcefully=false" > /dev/null || true
tail -f /tmp/j2ee.log
