#!/bin/bash
. "./scripts/.config"

for fake in $LIST;do
echo compiling $fake
gcc main.c -o "$APPS/$fake"
done