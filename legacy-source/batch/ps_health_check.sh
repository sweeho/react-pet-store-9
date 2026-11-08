#!/bin/sh
# PS_HEALTH_CHECK - every 10 minutes, all day.
# Requests the entry page of the storefront, OPC, supplier and admin web
# modules. Ends with code 8 when any module does not answer HTTP 200.
PS_JOB=PS_HEALTH_CHECK
. "${PS_HOME:-/opt/petstore}/conf/env.sh"
BAD=0
for URL in "$PS_STORE_URL/main.screen" "$PS_OPC_URL/EntityCatalog.jsp" "$PS_SUPPLIER_URL/" "$PS_ADMIN_URL/"; do
  CODE=$(curl -s -o /dev/null -m 20 -w '%{http_code}' "$URL")
  if [ "$CODE" != "200" ]; then
    ps_log "DOWN url=$URL http=$CODE"
    BAD=$((BAD + 1))
  fi
done
[ "$BAD" -eq 0 ] || exit 8
exit 0
