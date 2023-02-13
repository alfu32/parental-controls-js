#!/bin/bash
rm -rf build
mkdir build

for arch in x86_64-unknown-linux-gnu x86_64-pc-windows-msvc x86_64-apple-darwin aarch64-apple-darwin; do
    echo "ARCHITECTURE [$arch]"
    EXT=""
    if [ "$arch" == "x86_64-pc-windows-msvc" ];then
        OUT="build/parental-controls-$arch.exe"
        else
        OUT="build/parental-controls-$arch.bin"
    fi
    echo "ARCHITECTURE [$arch] [$OUT]"
    echo "deno build --allow-read --allow-write --allow-run --allow-net --allow-env --target \"$arch\" -o \"$OUT\" src/main.ts"
    deno compile --unstable --node-modules-dir --allow-read --allow-write --allow-run --allow-net --allow-env --target "$arch" -o "$OUT" src/main.ts
done
deno bundle src/main.ts > build/parental-controls.app.deno.js
cp scripts/parental-controls.app.deno.sh build/
cp config.json build/
cp -r node_modules build/
cp build/parental-controls.app.deno.js ./
minifier build/parental-controls.app.deno.js build/parental-controls.app.deno.min.js