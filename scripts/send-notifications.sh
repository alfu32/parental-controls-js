#!/bin/bash

CDIR=`pwd`
cd /home/alfu64/Development

for notif in ls notifications/todo;do
    . $notif
    mv $notif notifications/done
done