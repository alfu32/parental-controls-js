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


cat > build/parentalcontrols.service.run << SERVICEDEF
#!/bin/bash

SUPER_HOME=$CWD/build
CDIR=\`pwd\`
SERVICEDEF
for line in `env`;do
    echo "export $line" >> build/parentalcontrols.service.run
done
cat >> build/parentalcontrols.service.run << SERVICEDEF
#### eval "export $(egrep -z DBUS_SESSION_BUS_ADDRESS /proc/$(pgrep -u $TARGET_USER gnome-session)/environ)"
#### export DBUS_SESSION_BUS_ADDRESS=unix:path=/run/user/1000/bus
cd \$SUPER_HOME # /home/$TARGET_USER/parental-controls/

DATE=\`date +'%Y/%m/%d'\`
LOGS="logs/\$DATE"

./build/parental-controls-$arch.bin

cd \$CDIR
SERVICEDEF

chmod +x build/parentalcontrols.service.run

sudo systemctl stop parentalcontrols
sudo cp build/parentalcontrols.service /lib/systemd/system/
sudo systemctl daemon-reload
sudo systemctl start parentalcontrols
systemctl status parentalcontrols
