#!/bin/bash
. "./scripts/.config"

for fake in $LIST;do
echo compiling $fake
gcc main-cli.c -o "$APPS/$fake-cli"
done