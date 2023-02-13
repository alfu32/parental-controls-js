#!/bin/bash

BASE="/usr/share/icons/gnome/32x32"

for CAT in `ls $BASE`;do
	for icon in `ls "$BASE/$CAT"`;do
		echo "{\"cat\":\"$CAT\",\"name\":\"$icon\"}"
	done
done


