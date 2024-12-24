#!/bin/bash
json_file="./output/unziped.json"
size=$(jq '.data | length' "$json_file")
for((i=0;i<size;i++)); do
    id=$(jq -r ".data[$i].studentID" "$json_file")
    session=$(jq ".data[$i].session | map(select(. == 1)) | length" "$json_file")
    ts-node ./searchTest.ts "$id" "$session"
    if [ $? -eq 0 ]; then
        ts-node ./createGoogleTimeChart.ts "$id"
        if [ $? -eq 0 ]; then
            ts-node ./savePassRatio.ts "$id" "$session"
            if [ $? -eq 0 ]; then
                ts-node ./editGraphHTML.ts "$id" "$session"
            fi
        fi
    fi
done