#!/bin/bash
. "./scripts/.config"

INDEX=0
for fake in $LIST;do
echo killing $fake
pkill -SIGTERM $fake
done