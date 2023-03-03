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


cat > build/parentalcontrols.service << SERVICEDEF
[Unit]
Description=Parental Controls

[Service]
Restart=on-failure
RestartSec=5s
ExecStart=/home/$ADMIN_USER/.parental-controls/parentalcontrols.service.run

[Install]
WantedBy=multi-user.target
SERVICEDEF

cat > build/parentalcontrols.service.install << SRVINS
#!/bin/bash
# ~/.config/systemd/user/
SERVICENAME=parentalcontrols.service

sudo cp notify-send-all /usr/bin/
sudo cp wmctrl-all /usr/bin/
sudo systemctl disable \$SERVICENAME
sudo systemctl stop \$SERVICENAME
sudo rm /lib/systemd/system/\$SERVICENAME
sudo cp \$SERVICENAME /lib/systemd/system/
sudo systemctl daemon-reload
sudo systemctl start \$SERVICENAME
sudo systemctl enable \$SERVICENAME
journalctl -fu \$SERVICENAME -b
SRVINS
chmod +x build/parentalcontrols.service.install

cat > build/parentalcontrols.service.uninstall << SRVUNINS
#!/bin/bash
SERVICENAME=parentalcontrols.service


sudo systemctl stop \$SERVICENAME
sudo systemctl disable \$SERVICENAME
sudo rm -f /lib/systemd/system/\$SERVICENAME
sudo systemctl daemon-reload
sudo chown -R $ADMIN_USER:$ADMIN_USER /home/$ADMIN_USER/.parental-controls
SRVUNINS
chmod +x build/parentalcontrols.service.uninstall

cat > build/parentalcontrols-usermode.service << SERVICEDEF
[Unit]
Description=Parental Controls

[Service]
Restart=on-failure
RestartSec=5s
ExecStart=/home/$ADMIN_USER/.parental-controls/parentalcontrols.service.run

[Install]
WantedBy=default.target
SERVICEDEF

cat > build/parentalcontrols.userservice.install << SRVINS
#!/bin/bash
# ~/.config/systemd/user/
SERVICENAME=parentalcontrols-usermode.service

sudo cp notify-send-all /usr/bin/
sudo cp wmctrl-all /usr/bin/
systemctl --user disable \$SERVICENAME
systemctl --user stop \$SERVICENAME
systemctl --user status \$SERVICENAME
mkdir -p /home/$ADMIN_USER/.config/systemd/user
rm -rf  /home/$ADMIN_USER/.config/systemd/user/\$SERVICENAME
cp \$SERVICENAME /home/$ADMIN_USER/.config/systemd/user/
systemctl --user daemon-reload
systemctl --user start \$SERVICENAME
systemctl --user enable \$SERVICENAME
journalctl --user -fu \$SERVICENAME -b
SRVINS
chmod +x build/parentalcontrols.userservice.install

cat > build/parentalcontrols.userservice.uninstall << SRVUNINS
#!/bin/bash
SERVICENAME=parentalcontrols-usermode.service

systemctl --user stop \$SERVICENAME
systemctl --user disable \$SERVICENAME
rm -f /home/$ADMIN_USER/.config/systemd/user/\$SERVICENAME
systemctl --user daemon-reload
sudo chown -R $ADMIN_USER:$ADMIN_USER /home/$ADMIN_USER/.parental-controls
SRVUNINS
chmod +x build/parentalcontrols.userservice.uninstall

cat > build/parentalcontrols.service.run << SERVICEDEF
#!/bin/bash

SUPER_HOME=/home/$ADMIN_USER/.parental-controls
CDIR=\`pwd\`

cd \$SUPER_HOME 

DATE=\`date +'%Y/%m/%d'\`
LOGS="logs/\$DATE"

./parental-controls-$arch.bin

cd \$CDIR
SERVICEDEF
chmod +x build/parentalcontrols.service.run

########### cat > build/notify-send-all << SERVICEDEF
########### #!/bin/bash
########### 
########### HOME="/home/$TARGET_USER"
########### PATH=/usr/bin:/bin
########### NAME=$TARGET_USER
########### DISPLAY=:0
########### DBUS_ADDRESS=unix:path=/run/user/\$(id -u \$NAME)/bus
########### sudo -u "\$NAME" HOME="\$HOME" DISPLAY="\$DISPLAY" DBUS_SESSION_BUS_ADDRESS="\$DBUS_ADDRESS" PATH="\$PATH" notify-send "\$@"
########### SERVICEDEF
########### chmod +x build/notify-send-all


cat > build/notify-send-all << SERVICEDEF
#!/bin/bash

PATH=/usr/bin:/bin
IFS='
'
lines=(\$(who))
for line in \$lines;do
    IFS=' '
    arr=(\$line)
    ### echo "line[0] \${arr[0]}"
    ### echo "line[1] \${arr[1]}"
    NAME=\${arr[0]}
    DISPLAY=\${arr[1]}
    HOME="/home/\$NAME"
    DBUS_ADDRESS=unix:path=/run/user/\$(id -u \$NAME)/bus
    ### echo "
    ###              NAME : \$NAME
    ###           DISPLAY : \$DISPLAY
    ###              HOME : \$HOME
    ###      DBUS_ADDRESS : \$DBUS_ADDRESS
    ### "
    sudo -u "\$NAME" HOME="\$HOME" DISPLAY="\$DISPLAY" DBUS_SESSION_BUS_ADDRESS="\$DBUS_ADDRESS" PATH="\$PATH" notify-send "\$@"
done
SERVICEDEF
chmod +x build/notify-send-all

cat > build/wmctrl-all << SERVICEDEF
#!/bin/bash

HOME="/home/$TARGET_USER"
PATH=/usr/bin:/bin
NAME=$TARGET_USER
DISPLAY=:0
DBUS_ADDRESS=unix:path=/run/user/\$(id -u \$NAME)/bus
sudo -u "\$NAME" HOME="\$HOME" DISPLAY="\$DISPLAY" DBUS_SESSION_BUS_ADDRESS="\$DBUS_ADDRESS" PATH="\$PATH" wmctrl "\$@"

cd \$CDIR
SERVICEDEF
chmod +x build/wmctrl-all


########### cat > build/wmctrl-all << SERVICEDEF
########### #!/bin/bash
########### 
########### PATH=/usr/bin:/bin
########### IFS='
########### '
########### lines=(\$(who))
########### for line in \$lines;do
###########     IFS=' '
###########     arr=(\$line)
###########     ### echo "line[0] \${arr[0]}"
###########     ### echo "line[1] \${arr[1]}"
###########     NAME=\${arr[0]}
###########     DISPLAY=\${arr[1]}
###########     HOME="/home/\$NAME"
###########     DBUS_ADDRESS=unix:path=/run/user/\$(id -u \$NAME)/bus
###########     ### echo "
###########     ###              NAME : \$NAME
###########     ###           DISPLAY : \$DISPLAY
###########     ###              HOME : \$HOME
###########     ###      DBUS_ADDRESS : \$DBUS_ADDRESS
###########     ### "
###########     ##for DISPLAY in (:0 :1 :10 :11);do
###########         sudo -u "\$NAME" HOME="\$HOME" DISPLAY="\$DISPLAY" DBUS_SESSION_BUS_ADDRESS="\$DBUS_ADDRESS" PATH="\$PATH" wmctrl "\$@"
###########     ##done
########### done
########### SERVICEDEF
########### chmod +x build/wmctrl-all

#cp scripts/notify-send-all build/ 
#cp scripts/wmctrl-all build/ 


