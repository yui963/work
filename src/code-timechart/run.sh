#!/bin/bash
json_file="./preprocessing/output/unziped.json"
size=$(jq '.data | length' "$json_file")
for((i=0;i<size;i++)); do
    id=$(jq -r ".data[$i].studentID" "$json_file")
    if [ $? -ne 0 ]; then
        echo "Error parsing JSON for studentID at index $i"
        continue
    fi
    session=$(jq ".data[$i].session | map(select(. == 1)) | length" "$json_file")
    ts-node ./searchTest.ts "$id" "$session"
    if [ $? -eq 0 ]; then
        ts-node ./createGoogleTimeChart.ts "$id"
        if [ $? -eq 0 ]; then
            ts-node ./savePassRatio.ts "$id" "$session"
        fi
    fi
done
for((j=0;j<size;j++)); do
    id=$(jq -r ".data[$j].studentID" "$json_file")
    if [ $? -ne 0 ]; then
        echo "Error parsing JSON for studentID at index $j"
        continue
    fi
    session=$(jq ".data[$j].session | map(select(. == 1)) | length" "$json_file")
    ts-node ./editGraphHTML.ts "$id" "$session"
done