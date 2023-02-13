#!/bin/bash
rm -rf build
mkdir build

########### curl https://github.com/Pandawan/deno_notify/releases/download/$DVER/libdeno_notify.dll -o build/libdeno_notify.dll
########### curl https://github.com/Pandawan/deno_notify/releases/download/$DVER/libdeno_notify.dylib -o build/libdeno_notify.dylib
########### curl https://github.com/Pandawan/deno_notify/releases/download/$DVER/libdeno_notify.so -o build/libdeno_notify.so
########### 
########### cat > build/run.x86_64-unknown-linux-gnu.sh  <<SRC #!/bin/bash
########### 
########### ### deno run --allow-read --allow-write --allow-env --allow-run --allow-net --allow-ffi src/main.ts
########### # https://github.com/Pandawan/deno_notify/releases/download/1.1.1/libdeno_notify.so
########### DVER=1.1.1
########### export NOTIFY_PLUGIN_URL="https://github.com/Pandawan/deno_notify/releases/download/$DVER/libdeno_notify.so"
########### deno run --unstable --allow-all src/main.ts
########### SRC
########### 
########### cat > build/run.x86_64-pc-windows-msvc.cmd <<SRC #!/bin/bash
########### 
########### ### deno run --allow-read --allow-write --allow-env --allow-run --allow-net --allow-ffi src/main.ts
########### # https://github.com/Pandawan/deno_notify/releases/download/1.1.1/libdeno_notify.dll
########### DVER=1.1.1
########### export NOTIFY_PLUGIN_URL="https://github.com/Pandawan/deno_notify/releases/download/$DVER/libdeno_notify.dll"
########### deno run --unstable --allow-all src/main.ts
########### SRC
########### 
########### cat > build/run.x86_64-apple-darwin.run <<SRC #!/bin/bash
########### 
########### ### deno run --allow-read --allow-write --allow-env --allow-run --allow-net --allow-ffi src/main.ts
########### # https://github.com/Pandawan/deno_notify/releases/download/1.1.1/libdeno_notify.dylib
########### DVER=1.1.1
########### export NOTIFY_PLUGIN_URL="https://github.com/Pandawan/deno_notify/releases/download/$DVER/libdeno_notify.dylib"
########### deno run --unstable --allow-all src/main.ts
########### SRC
########### 

for arch in x86_64-unknown-linux-gnu x86_64-pc-windows-msvc x86_64-apple-darwin aarch64-apple-darwin; do
    echo "ARCHITECTURE [$arch]"
    EXT=""
    if [ "$arch" == "x86_64-pc-windows-msvc" ];then
        OUT="build/parental-controls-$arch.exe"
        else
        OUT="build/parental-controls-$arch.bin"
    fi
    echo "ARCHITECTURE [$arch] [$OUT]"
    ### echo "deno build --allow-read --allow-write --allow-run --allow-net --allow-env --allow-ffi --target \"$arch\" -o \"$OUT\" src/main.ts"
    echo "deno build --allow-all --target \"$arch\" -o \"$OUT\" src/main.ts"
    deno compile --unstable --node-modules-dir --allow-all --target "$arch" -o "$OUT" src/main.ts
done
deno bundle src/main.ts > build/parental-controls.app.deno.js
cp scripts/parental-controls.app.deno.sh build/
cp config.json build/
cp -r node_modules build/
cp parental-controls.service.run build/
cp parental-controls.service build/
########## cp build/parental-controls.app.deno.js ./
########## minifier build/parental-controls.app.deno.js build/parental-controls.app.deno.min.js