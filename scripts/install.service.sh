#!/bin/bash

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

{
cat << SERVICEDEF
#!/bin/bash

SUPER_HOME=$CWD/build
CDIR=\`pwd\`

####################### copying environment of $TARGET_USER
SERVICEDEF

for procid in `pgrep -u $TARGET_USER gnome-session`;do
    cat /proc/$procid/environ | egrep -z DBUS_SESSION_BUS_ADDRESS
    echo ""
done

echo ""
cat << SERVICEDEF
####################### done copying environment of $TARGET_USER
#### eval \"export \\$\(egrep -z DBUS_SESSION_BUS_ADDRESS \\"/proc/\\$\(pgrep -u $TARGET_USER gnome-session)/environ\)\\"\)\"
#### export DBUS_SESSION_BUS_ADDRESS=unix:path=/run/user/1000/bus
cd \$SUPER_HOME # /home/$TARGET_USER/parental-controls/

DATE=\`date +'%Y/%m/%d'\`
LOGS="logs/\$DATE"

./parental-controls-$arch.bin

cd \$CDIR
SERVICEDEF
} > build/parentalcontrols.service.run
chmod +x build/parentalcontrols.service.run

sudo systemctl disable parentalcontrols
sudo systemctl stop parentalcontrols
sudo cp build/parentalcontrols.service /lib/systemd/system/
sudo systemctl daemon-reload
sudo systemctl start parentalcontrols
sudo systemctl enable parentalcontrols

