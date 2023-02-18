#!/bin/bash
rm -rf build
mkdir build
CWD=`pwd`
ADMIN_USER=$1
TARGET_USER=$2
arch=$3
DS=`date +'%Y%m%d%H%M%S'`

. "./scripts/semver.sh"

{
    echo "{"
    echo "    \"BUILD_DATE\":\"$DS\","
    echo "    \"COMMIT_ID\":\"$(git rev-parse HEAD)\","
    echo "    \"BRANCH\":\"$(git rev-parse --abbrev-ref HEAD)\","
    echo "    \"TAG\":\"$(git describe --tags)\","
    echo "    \"SEMVER\":\"$SEMVER\""
    echo "}"
} > build/release.info.json
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


cat > build/parentalcontrols.service.install << SRVINS
#!/bin/bash
# ~/.config/systemd/user/

sudo systemctl disable parentalcontrols
sudo systemctl stop parentalcontrols
sudo rm /lib/systemd/system/parentalcontrols.service
sudo cp parentalcontrols.service /lib/systemd/system/
sudo systemctl daemon-reload
sudo systemctl start parentalcontrols
sudo systemctl enable parentalcontrols
journalctl -fu parentalcontrols.service -b
SRVINS
chmod +x build/parentalcontrols.service.install

cat > build/parentalcontrols.userservice.install << SRVINS
#!/bin/bash
# ~/.config/systemd/user/

systemctl --user disable parentalcontrols
systemctl --user stop parentalcontrols
systemctl --user disable parentalcontrols
mkdir -p /home/$ADMIN_USER/.config/systemd/user
cp parentalcontrols.service /home/$ADMIN_USER/.config/systemd/user/
systemctl --user daemon-reload
systemctl --user start parentalcontrols
systemctl --user enable parentalcontrols
journalctl -fu parentalcontrols.service -b
SRVINS
chmod +x build/parentalcontrols.userservice.install

cat > build/parentalcontrols.service << SERVICEDEF
[Unit]
Description=Parental Controls

[Service]
ExecStart=/home/$ADMIN_USER/parental-controls/parentalcontrols.service.run

[Install]
WantedBy=multi-user.target
SERVICEDEF

{
cat << SERVICEDEF
#!/bin/bash

SUPER_HOME=/home/$ADMIN_USER/parental-controls
CDIR=\`pwd\`

####################### copying environment of $TARGET_USER
SERVICEDEF
echo "
for procid in \$(pgrep -u $TARGET_USER gnome-session);do"
echo '    export "$(cat /proc/$procid/environ | egrep -z DBUS_SESSION_BUS_ADDRESS)"
done
'
echo ""
ID=`id -u`
echo 'export XDG_RUNTIME_DIR=/run/user/$(id -u $TARGET_USER)'
cat << SERVICEDEF
####################### done copying environment of $TARGET_USER

#### export XDG_RUNTIME_DIR=/run/user/\$(id -u $TARGET_USER)
#### export DISPLAY=:0
#### export XAUTHORITY=/home/$TARGET_USER/.Xauthority
#### export DBUS_SESSION_BUS_ADDRESS=unix:path=/run/user/\$(id -u $TARGET_USER)/bus
#### eval \"export \\$\(egrep -z DBUS_SESSION_BUS_ADDRESS \\"/proc/\\$\(pgrep -u $TARGET_USER gnome-session)/environ\)\\"\)\"
#### export DBUS_SESSION_BUS_ADDRESS=unix:path=/run/user/\$(id -u)/bus
export DBUS_SESSION_BUS_ADDRESS="\${DBUS_SESSION_BUS_ADDRESS:-unix:path=/run/user/\$(id -u $TARGET_USER)/bus}"
cd \$SUPER_HOME # /home/$TARGET_USER/parental-controls/

DATE=\`date +'%Y/%m/%d'\`
LOGS="logs/\$DATE"

./parental-controls-$arch.bin

cd \$CDIR
SERVICEDEF
} > build/parentalcontrols.service.run
chmod +x build/parentalcontrols.service.run


