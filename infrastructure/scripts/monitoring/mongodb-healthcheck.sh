#!/bin/bash

# MongoDB health check script
mongosh --quiet --eval "db.runCommand({ ping: 1 }).ok" || exit 1
exit 0
