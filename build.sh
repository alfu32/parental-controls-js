#!/bin/bash
rm -rf build
mkdir build
deno compile --allow-read --allow-write --allow-run --target x86_64-unknown-linux-gnu  -o build/parental-controls-x86_64-unknown-linux-gnu main.ts
deno compile --allow-read --allow-write --allow-run --target x86_64-pc-windows-msvc  -o build/parental-controls-x86_64-pc-windows-msvc.exe main.ts
deno compile --allow-read --allow-write --allow-run --target x86_64-apple-darwin  -o build/parental-controls-x86_64-apple-darwin main.ts
deno compile --allow-read --allow-write --allow-run --target aarch64-apple-darwin  -o build/parental-controls-aarch64-apple-darwin main.ts