#!/bin/bash
# student_numbers=("70110703" "70210014" "70210502" "70210096" "70210506")
student_numbers=("70210014")
sid="10"
for student_number in "${student_numbers[@]}"; do
    ts-node ./searchTest.ts "${student_number}" "${sid}"
    if [ $? -eq 0 ]; then
        ts-node ./createGoogleTimeChart.ts "${student_number}"
        if [ $? -eq 0 ]; then
            ts-node ./savePassRatio.ts "${student_number}" "${sid}"
        fi
    fi
done
for student_number in "${student_numbers[@]}"; do
    ts-node ./editGraphHTML.ts "${student_number}" "${sid}"
done
