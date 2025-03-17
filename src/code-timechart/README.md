# CODING-LOG-TIMECHART

This project is application for analyzing learners' coding activity date collected by using kokokonolabs-logger vscode extensions.

For a full description of the module, visit the
[project page](https://bitbucket.org/yasuhironoguchi/coding-log-timechart).

## Table of contents (optional)

- Overview
- Usage
- Configuration

## Overview

These scripts are categorized the following four components.

### analyzeStateInfo.ts

Analyzing the learners' states in their coding activities based on the collected data from kokokonolabs-logger vscode extensions.

- Input: ./data/...
- Configuratino: dataInfo.ts
- Output: ./output/stateInfoList.json

### createGoogleTimeChart.ts

Generate time chart graph by using Google Time-Line chart libraries.

- Input:
  ./output/stateInfoList.json
  ./output/testInfoByDate/<student_number>testInfoByDate.json(New)
- Output:
  ./output/chart/...
  ./output/passRatio/<student_number>/<session_id>passRatio.txt(New)
  ./output/graph/...(New)
  ./output/failedTestLifeTime/<student_number>/<session_id>failedTestLifeTime.txt(New)
  ./output/failedTestLifeTime/<student_number>/<session_id>timeline.txt(New)
  ./output/studentResult.json(New)

### calcIndicator.ts

It generates HTML file with time-chart graph which shows learner's coding activities in each session.

- Input: ./output/stateInfoList.json
- Output: ./output/csv/AllIndicators.csv

### indicators.ipynb

Is analyzes indicators of learners' coding activities.

- Input: ./output/csv/AllIndicators.csv

### searchTest.ts (New)

Get the number of tests from the workspace.

- Input:
  G:unzips/<student_number>/<session_id>/~/ws-history/...
  ./chart-template/graph-template.txt
  ./miniCV00forStudent2024/src/test/java/lang/...

- Output:
  ./output/graph/...
  ./output/testInfoByDate/<student_number>testInfoByDate.json

###savePassRatio.ts (New)

- Input: ./output/passRatio/<student_number>/<session_id>passRatio.txt
- Output: ./output/studentResult.json

###editGraphHTML.ts (New)

- Input:
  ./output/graph/<student_number>/graph-<student_number>-<session_id>.txt
  ./output/graph/passRatio/<student_number>/<session_id>passRatio.txt
  ./output/failedTestLifeTime/<student_number>/<session_id>failedTestLifeTime.json
  ./output/failedTestLifeTime/<student_number>/<session_id>timeline.txt
- Output: ./output/graph/<student_number>/graph-<student_number>-<session_id>.html

## Usage

### analyzeStateInfo.ts

First, you execute "analyzeStateInfo.ts" script as follows.

> ts-node .\analyzeStateInfo.ts

This script analyzes learners' coding activity date stored in data/ directory based on configuration of dataInfo.ts.
It saves analyzed data into output/stateInfoList.json in JSON format. The following scripts use this analyzed data as their input.

### createGoogleTimeChart.ts

Next, you can create time chart graph and calcucate some indicators based on the analyzed data.
For creating time chart graph, you execute "createGoogleTimeChart.ts" as follows.

> ts-node .\createGoogleTimeChart.ts

The script create time chart graph HTML files based on analyzed data (./output/stateInfoList.json).
It uses Google Time-Line chart libraries (https://developers.google.com/chart/interactive/docs/gallery/timeline).
It saves create chart graph HTML files into ./output/chart directory.

(New)
The script generates time chart graph files based on analyzed data (./output/stateInfoList.json).
It originally used Google Timeline Chart libraries (https://developers.google.com/chart/interactive/docs/gallery/timeline) to generate HTML files,
but this functionality has been commented out.
Instead, the script now outputs a .txt file formatted based on a predefined template for later conversion into an HTML chart (./output/graph/...).
During the analysis of stateInfoList.json, when test events are loaded, the success or failure status of each test and the failure duration are updated in an array.
At that point, the test success rate is recorded in:

./output/passRatio/<student_number>/<session_id>passRatio.txt

Furthermore, based on the order of the loaded events, different activity patterns are classified, and their respective time periods are written to a .txt file.
It saves time data left as failure into ./output/failedTestLifeTime, and it saves data used to rank into ./output/studentResult.json.

### calcIndicator.ts

Besides indicators on analyzed data, you can execute "calcIndicator.ts" as follows.
It calculate some indicators from analyzed data. It saves these indicators into "./output/csv/AllIndicators.csv" in CSV format.

> ts-node .\calcIndicator.ts

### indicators.ipynb

To overview the indicators, you opens "indicators.ipynb" in Jupyter Notebook.
It is a sample code for visualize the indicators from "./output/csv/AllIndicators.csv"

### searchTest.ts (New)

To analyze test files and extract information about test methods, execute the following command:

> ts-node ./searchTest.ts <student_number> <session_id>

This script searches for test method annotations (@Test) in Java test files within the workspace.
It extracts the test method names along with their corresponding file names and timestamps, then stores this information in JSON format
(.output/testInfoByDate).
It saves create chart graph txt files into ./output/graph directory.

###savePassRatio.ts (New)
Read the test success rate (<session_id>passRatio.txt) over time of the exercise,
find the difference from the ideal model, and save the average in studentResult.json.

> ts-node ./savePassRatio.ts <student_number> <session_id>

###editGraphHTML.ts (New)
Overwrite the GoogleTimeChart in txt format with the test success rate over time for the exercise and its ideal model,
the test abandonment time (name + max abandonment time, timeline data),
and the ranking of each visualization item, and output as final html.

> ts-node ./editGraphHTML <student_number> <session_id>

## Configuration

Leaners' coding activity data collected by kokokonolabs-logger vscode extension should be saved in "./data/" directory. Basically, the data collected by a learner and a session. In "dataInfo.ts", valuable "targetData" is the configurations for the data locations. The script "analyzeStateInfo.ts" load the learners' activity data based on the "targetData" configuration.

    export const targetData = {
        data: [
            {
                sid: "00010001",
                dataList: [
                    {
                        session: 'cv01',
                        path: './data/00010001/cv01/kokokonolabs',
                        runResultsType: 'debug-sessions'
                    },
                    {
                        session: 'cv02',
                        path: './data/00010001/cv02/kokokonolabs',
                        runResultsType: 'run-results'
                    }
                ]
            }
        ]
    }

## Maintainers (optional)

- Yasuhiro Noguchi (https://bitbucket.org/yasuhironoguchi/)
- Yuito Yamamoto (https://bitbucket.org/yuito-yamamoto/)
