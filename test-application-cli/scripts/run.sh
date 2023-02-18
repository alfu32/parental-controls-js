#!/bin/bash
. "./scripts/.config"

INDEX=0
for fake in $LIST;do
echo running $fake
"./$APPS/$fake-cli" $(($INDEX + 5)) "fake application $fake is running in the background" &
INDEX=$(($INDEX+1)) 
done