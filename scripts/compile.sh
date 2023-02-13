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
    ### deno compile --allow-read --allow-write --allow-run --allow-net --allow-env --target "$arch" -o "$OUT" src/main.ts
    deno compile --allow-all --target "$arch" -o "$OUT" src/main.ts
done
cp scripts/config.json build/
cp scripts/parentalcontrols.service build/
cp scripts/parental-controls.service.run build/