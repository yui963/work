#!/bin/bash
studentFile="G:/FoldersName2024/FoldersName2024ALL.txt"
while IFS= read -r studentID; do
  # \rを削除
  studentID=$(echo "$studentID" | tr -d '\r')
  echo "Processing student ID: $studentID"
  ts-node analyzeStateInfo.ts "$studentID"
done < "$studentFile"
