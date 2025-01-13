#!/bin/bash
# student_numbers=("70110005" "70110008" "70110009" "70110014")
student_numbers=("70210036")
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
