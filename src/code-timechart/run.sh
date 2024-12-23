#!/bin/bash
ID = $1
ts-node ./searchTest.ts $ID 7
if [ $? -eq 0 ]; then
    ts-node ./createGoogleTimeChart.ts $ID
    if [ $? -eq 0 ]; then
        ts-node ./savePassRatio.ts $ID 7
        if [ $? -eq 0 ]; then
            ts-node ./editGraphHTML.ts $ID 7
        fi
    fi
fi