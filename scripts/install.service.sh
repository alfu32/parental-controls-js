sudo systemctl stop parentalcontrols
sudo cp build/parentalcontrols.service /lib/systemd/system/
sudo systemctl daemon-reload
sudo systemctl start parentalcontrols
systemctl status parentalcontrols
