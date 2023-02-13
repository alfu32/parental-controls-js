#!/bin/bash

eval "export $(egrep -z DBUS_SESSION_BUS_ADDRESS /proc/$(pgrep -u $LOGNAME gnome-session)/environ)";
env

zenity --info --test howdy
notify-send -a nautilus -c info -u low -t 30000 "a message" "from beyond. muahahahaha !"



