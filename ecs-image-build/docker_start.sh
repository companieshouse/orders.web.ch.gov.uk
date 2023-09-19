#!/bin/bash
# Start script for orders-web-ch-gov-uk

PORT=3000
export NODE_PORT=${PORT}
exec node /opt/bin/www.js -- ${PORT}