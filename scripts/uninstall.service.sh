#!/bin/bash


sudo systemctl stop parentalcontrols
sudo systemctl disable parentalcontrols
sudo rm -f /lib/systemd/system/parentalcontrols.service
sudo systemctl daemon-reload
sudo chown -R $USER:$USER build

