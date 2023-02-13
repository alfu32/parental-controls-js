#!/bin/bash

### deno run --allow-read --allow-write --allow-env --allow-run --allow-net --allow-ffi src/main.ts
# https://github.com/Pandawan/deno_notify/releases/download/1.1.1/libdeno_notify.so
DVER=1.1.1
export NOTIFY_PLUGIN_URL="https://github.com/Pandawan/deno_notify/releases/download/$DVER/libdeno_notify.so"
deno run --unstable --allow-all src/main.ts