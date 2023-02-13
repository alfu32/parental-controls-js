#!/bin/bash
rm -rf build
mkdir build
CWD=`pwd`
TARGET_USER=$1
arch=$2


cat > build/parentalcontrols.service << SERVICEDEF
[Unit]
Description=Parental Controls

[Service]
ExecStart=$CWD/build/parentalcontrols.service.run

[Install]
WantedBy=multi-user.target
SERVICEDEF


cat > build/parentalcontrols.service.run << SERVICEDEF
#!/bin/bash

SUPER_HOME=$CWD/build
CDIR=\`pwd\`
#### eval "export $(egrep -z DBUS_SESSION_BUS_ADDRESS /proc/$(pgrep -u devlin gnome-session)/environ)"
export DBUS_SESSION_BUS_ADDRESS=unix:path=/run/user/1000/bus
cd \$SUPER_HOME # /home/$TARGET_USER/parental-controls/

DATE=\`date +'%Y/%m/%d'\`
LOGS="logs/\$DATE"

./build/parental-controls-$arch.bin

cd \$CDIR
SERVICEDEF

### for arch in x86_64-unknown-linux-gnu x86_64-pc-windows-msvc x86_64-apple-darwin aarch64-apple-darwin; do
### done
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

deno bundle src/main.ts > build/parental-controls.app.deno.js
cp scripts/parental-controls.app.deno.sh build/
cp config.json build/
cp -r node_modules build/
########## cp scripts/parental-controls.service.run build/
########## cp scripts/parentalcontrols.service build/
########## cp build/parental-controls.app.deno.js ./
########## minifier build/parental-controls.app.deno.js build/parental-controls.app.deno.min.js
