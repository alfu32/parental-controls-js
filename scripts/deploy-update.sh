
SSH_HOST=$1

SSH_USER=$2
CWD=`pwd`
ADMIN_USER=$2
TARGET_USER=$3
arch=$4
DS=`date +'%Y%m%d%H%M%S'`

#echo -n SSH Password :
#read -s SSH_PWD

SSH_CONNECTION="$SSH_USER@$SSH_HOST"

echo ""
echo $SSH_CONNECTION
echo ""
SSH_TARGET=$SSH_CONNECTION:/home/$ADMIN_USER/parental-controls

ssh $SSH_CONNECTION 'systemctl --user stop parentalcontrols'
ssh $SSH_CONNECTION 'systemctl --user status parentalcontrols'
ssh $SSH_CONNECTION "mkdir '/home/$ADMIN_USER/parental-controls'"
scp "./build/parental-controls-$arch.bin" $SSH_TARGET
scp "./build/notify-send-all" $SSH_TARGET
# scp ./config.json $SSH_TARGET
scp "./build/parentalcontrols.service.run" $SSH_TARGET
scp "./build/parentalcontrols.service" $SSH_TARGET
scp "./build/parentalcontrols-usermode.service" $SSH_TARGET
scp "./build/parentalcontrols.service.install" $SSH_TARGET
scp "./build/parentalcontrols.userservice.install" $SSH_TARGET
scp "./build/parentalcontrols.service.uninstall" $SSH_TARGET
scp "./build/parentalcontrols.userservice.uninstall" $SSH_TARGET
scp "./build/release.info.json" $SSH_TARGET
ssh $SSH_CONNECTION 'systemctl --user start parentalcontrols'
# ssh -S $SSH_CONNECTION 'systemctl --user start parentalcontrols'
ssh $SSH_CONNECTION 'systemctl --user status parentalcontrols'