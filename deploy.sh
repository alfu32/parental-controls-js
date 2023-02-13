
### echo -n Password: 
### read -s PASSWORD

ssh alfu64@192.168.1.27 'systemctl status parentalcontrols'
ssh -S alfu64@192.168.1.27 'sudo systemctl stop parentalcontrols'   ### < $PASSWORD
ssh -S alfu64@192.168.1.27 'sudo systemctl disable parentalcontrols'   ### < $PASSWORD
ssh alfu64@192.168.1.27 'mkdir parental-controls'
scp ./build/parental-controls-x86_64-unknown-linux-gnu.bin alfu64@192.168.1.27:/home/alfu64/parental-controls
scp ./config.json alfu64@192.168.1.27:/home/alfu64/parental-controls
scp ./parental-controls.service.run alfu64@192.168.1.27:/home/alfu64/parental-controls
scp ./parentalcontrols.service alfu64@192.168.1.27:/home/alfu64/parental-controls
## ssh -S alfu64@192.168.1.27 'cd /home/alfu64/parental-controls;sudo cp parentalcontrols.service /lib/systemd/system/'
## ssh -S alfu64@192.168.1.27 'sudo systemctl start parentalcontrols'
## ssh -S alfu64@192.168.1.27 'sudo systemctl enable parentalcontrols'
## ssh alfu64@192.168.1.27 'systemctl status parentalcontrols'

#### ssh alfu64@192.168.1.31 'mkdir parental-controls'
#### scp ./build/parental-controls-x86_64-unknown-linux-gnu.bin alfu64@192.168.1.31:/home/alfu64/parental-controls
#### scp ./config.json alfu64@192.168.1.31:/home/alfu64/parental-controls
#### scp ./parental-controls.service.run alfu64@192.168.1.31:/home/alfu64/parental-controls
#### scp ./parentalcontrols.service alfu64@192.168.1.31:/home/alfu64/parental-controls
