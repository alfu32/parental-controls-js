
SSH_HOST=$1

echo SSH User :
read -s SSH_USR
echo -n SSH Password :
read -s SSH_PWD

SSH_CONNECTION="$SSH_USER:$SSH_PWD@$SSH_HOST"


ssh $SSH_CONNECTION 'systemctl status parentalcontrols'
ssh -S $SSH_CONNECTION 'sudo systemctl stop parentalcontrols'
ssh -S $SSH_CONNECTION 'sudo systemctl disable parentalcontrols'
ssh $SSH_CONNECTION 'mkdir parental-controls'
scp ./build/parental-controls-x86_64-unknown-linux-gnu.bin $SSH_CONNECTION:/home/alfu64/parental-controls
scp ./config.json $SSH_CONNECTION:/home/alfu64/parental-controls
scp ./parental-controls.service.run $SSH_CONNECTION:/home/alfu64/parental-controls
scp ./parentalcontrols.service $SSH_CONNECTION:/home/alfu64/parental-controls