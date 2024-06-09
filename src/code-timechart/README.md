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
- Input: ./output/stateInfoList.json
- Output: ./output/chart/...

### calcIndicator.ts
It generates HTML file with time-chart graph which shows learner's coding activities in each session.
- Input: ./output/stateInfoList.json
- Output: ./output/csv/AllIndicators.csv

### indicators.ipynb
Is analyzes indicators of learners' coding activities.
- Input: ./output/csv/AllIndicators.csv

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

### calcIndicator.ts

Besides indicators on analyzed data, you can execute "calcIndicator.ts" as follows.
It calculate some indicators from analyzed data. It saves these indicators into "./output/csv/AllIndicators.csv" in CSV format.

> ts-node .\calcIndicator.ts

### indicators.ipynb

To overview the indicators, you opens "indicators.ipynb" in Jupyter Notebook.
It is a sample code for visualize the indicators from "./output/csv/AllIndicators.csv"

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