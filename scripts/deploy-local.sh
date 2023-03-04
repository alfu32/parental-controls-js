#!/bin/bash

CWD=`pwd`
ADMIN_USER=$1
arch=$2
DS=`date +'%Y%m%d%H%M%S'`

INSTALL_DIR=/home/$ADMIN_USER/.parental-controls/

sudo systemctl stop parentalcontrols
sudo systemctl disable parentalcontrols
systemctl status parentalcontrols
mkdir .parental-controls
cp "./build/parental-controls-$arch.bin" $INSTALL_DIR
cp "./build/to-all" $INSTALL_DIR
cp "./build/notify-send-all" $INSTALL_DIR
cp "./build/wmctrl-all" $INSTALL_DIR
# scp ./config.json $INSTALL_DIR
cp "./build/parentalcontrols.service.run" $INSTALL_DIR
cp "./build/parentalcontrols.service" $INSTALL_DIR
cp "./build/parentalcontrols-usermode.service" $INSTALL_DIR
cp "./build/parentalcontrols.service.install" $INSTALL_DIR
cp "./build/parentalcontrols.userservice.install" $INSTALL_DIR
cp "./build/parentalcontrols.service.uninstall" $INSTALL_DIR
cp "./build/parentalcontrols.userservice.uninstall" $INSTALL_DIR
cp "./build/release.info.json" $INSTALL_DIR
sudo systemctl enable parentalcontrols
sudo systemctl start parentalcontrols
systemctl status parentalcontrols