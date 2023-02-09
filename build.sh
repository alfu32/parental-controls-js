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
    deno compile --allow-read --allow-write --allow-run --target "$arch" -o "$OUT" main.ts
done