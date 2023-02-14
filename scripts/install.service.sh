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
    echo "export \"$(cat /proc/$procid/environ | egrep -z DBUS_SESSION_BUS_ADDRESS)\""
    echo ""
done

echo ""
ID=`id -u`
echo "export XDG_RUNTIME_DIR=/run/user/$ID" 
cat << SERVICEDEF
####################### done copying environment of $TARGET_USER

export DISPLAY=:0
export XAUTHORITY=/home/$TARGET_USER/.Xauthority
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

cat > build/send-notifications.sh <<NOTIFIER
#!/bin/bash

CDIR=`pwd`
cd $CWD/build/
mkdir -p notifications/done

for notif in \`ls notifications/todo\`;do
    echo "exec ./notifications/todo/./\$notif"
    cat ./notifications/todo/./\$notif  
    chmod +x "notifications/todo/\$notif"
    ./notifications/todo/./\$notif
    . "notifications/todo/\$notif"
    mv "notifications/todo/\$notif" notifications/done/
    cp "notifications/todo/\$notif" notifications/done/
done
mv "notifications/todo/*" notifications/done/
cd $CDIR
NOTIFIER
chmod +x build/send-notifications.sh


sudo systemctl disable parentalcontrols
sudo systemctl stop parentalcontrols
sudo cp build/parentalcontrols.service /lib/systemd/system/
sudo systemctl daemon-reload
sudo systemctl start parentalcontrols
sudo systemctl enable parentalcontrols
journalctl -fu parentalcontrols.service -b

