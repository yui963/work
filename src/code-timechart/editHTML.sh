#!/bin/bash
json_file="./preprocessing/output/unziped.json"
size=$(jq '.data | length' "$json_file")
for((i=0;i<size;i++)); do
    id=$(jq -r ".data[$i].studentID" "$json_file")
    session=$(jq ".data[$i].session | map(select(. == 1)) | length" "$json_file")
    ts-node ./editGraphHTML.ts "$id" "$session"
done