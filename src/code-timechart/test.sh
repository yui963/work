#!/bin/bash
for((i=0;i<1;i++)); do
    ts-node ./searchTest.ts "70110014" "7"
    if [ $? -eq 0 ]; then
        ts-node ./createGoogleTimeChart.ts "70110014"
        if [ $? -eq 0 ]; then
            ts-node ./savePassRatio.ts "70110014" "7"
        fi
    fi
done
for((i=0;i<1;i++)); do
    ts-node ./editGraphHTML.ts "70110014" "7"
done