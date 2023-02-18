
SSH_HOST=$1

SSH_USER=$2
TARGET_USER=$3
arch=$4

#echo -n SSH Password :
#read -s SSH_PWD

SSH_CONNECTION="$SSH_USER:$SSH_PWD@$SSH_HOST"
SSH_CONNECTION="$SSH_USER@$SSH_HOST"

echo ""
echo $SSH_CONNECTION
echo ""

ssh $SSH_CONNECTION 'systemctl status parentalcontrols'
ssh -S $SSH_CONNECTION 'sudo systemctl stop parentalcontrols'
ssh -S $SSH_CONNECTION 'sudo systemctl disable parentalcontrols'
ssh $SSH_CONNECTION 'mkdir parental-controls'
scp ./build/parental-controls-$arch.bin $SSH_CONNECTION:/home/$SSH_USER/parental-controls
# scp ./config.json $SSH_CONNECTION:/home/$SSH_USER/parental-controls
scp ./build/parentalcontrols.service.run $SSH_CONNECTION:/home/$SSH_USER/parental-controls
scp ./build/parentalcontrols.service $SSH_CONNECTION:/home/$SSH_USER/parental-controls
scp ./build/parentalcontrols.service.install $SSH_CONNECTION:/home/$SSH_USER/parental-controls