#!/bin/bash
studentFile="G:/FoldersName2024/FoldersName2024All.txt"
while IFS= read -r studentID; do
  echo "Processing student ID: $studentID"
  ts-node analyzeStateInfo.ts "$studentID"
done < "$studentFile"