#!/bin/bash

TARGET_USER=$1

DS=`date +'%Y%m%d%H%M%S'`
rm -rf dist
vite build
cp ../scripts/fileserve-static.sh dist/
. "../scripts/semver.sh"
{
    echo "{"
    echo "    \"BUILD_DATE\":\"$DS\","
    echo "    \"COMMIT_ID\":\"$(git rev-parse HEAD)\","
    echo "    \"BRANCH\":\"$(git rev-parse --abbrev-ref HEAD)\","
    echo "    \"TAG\":\"$(git describe --tags)\","
    echo "    \"SEMVER\":\"$SEMVER\""
    echo "}"
} > dist/build.json


FILE=dist/parentalcontrolsui.service
cat > $FILE << SERVICEDEF
[Unit]
Description=Parental Controls

[Service]
ExecStart=/home/$TARGET_USER/.cargo/bin/./miniserve /home/$TARGET_USER/.parental-controls-ui/

[Install]
WantedBy=multi-user.target
SERVICEDEF

FILE=dist/parentalcontrolsui.service.install
cat > $FILE << SRVINS
#!/bin/bash
# ~/.config/systemd/user/
SERVICENAME=parentalcontrolsui.service

sudo systemctl disable \$SERVICENAME
sudo systemctl stop \$SERVICENAME
sudo rm /lib/systemd/system/\$SERVICENAME
sudo cp \$SERVICENAME /lib/systemd/system/
sudo systemctl daemon-reload
sudo systemctl start \$SERVICENAME
sudo systemctl enable \$SERVICENAME
journalctl -fu \$SERVICENAME -b
SRVINS
FILE=dist/parentalcontrolsui.service.install
chmod +x $FILE

FILE=dist/parentalcontrolsui.service.uninstall
cat > $FILE << SRVUNINS
#!/bin/bash
SERVICENAME=parentalcontrols.service


sudo systemctl stop \$SERVICENAME
sudo systemctl disable \$SERVICENAME
sudo rm -f /lib/systemd/system/\$SERVICENAME
sudo systemctl daemon-reload
sudo chown -R $TARGET_USER:$TARGET_USER /home/$TARGET_USER/.parental-controls-ui
SRVUNINS
chmod +x $FILE
