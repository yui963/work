import * as fs from "fs-extra";
import { State } from "./State";
import { TestEvent, TestTree } from "./analyzeTestResults";
import { EditEvent } from "./analyzeEditActivity";
import { RunEvent } from "./analyzeRunResults";
import { WSEvent } from "./analyzeWS";
import { getFileNameFromDotPath, isProductCode, isTestCode } from "./common";
import * as path from "path";
import { existsSync } from "fs";
import { time } from "console";
import { TestInfoByDate, TestInfoBySid } from "../graph/searchTest";
import { fail } from "assert";

interface GTimeChartData {
  state: State;
  rowLabel: String;
  barLabel: String;
  tooltip: String;
  begin: number;
  end: number;
  beginDate: Date;
  endDate: Date;
}

async function getSummaryData(base: GTimeChartData): Promise<GTimeChartData> {
  let rowLabel = "#SUMMARY";
  const state = base.state;

  if (state.type == "edit") {
    const event: EditEvent = state.info as EditEvent;
    if (isProductCode(event.filePath)) {
      if (base.barLabel == "onDidChangeTextDocument") {
        rowLabel += "|MAIN|EDITTING";
      } else {
        rowLabel += "|MAIN|READING";
      }
    } else if (isTestCode(event.filePath)) {
      if (base.barLabel == "onDidChangeTextDocument") {
        rowLabel += "|TEST|EDITTING";
      } else {
        rowLabel += "|TEST|READING";
      }
    } else {
      if (base.barLabel == "onDidChangeTextDocument") {
        rowLabel += "|OTHER|EDITTING";
      } else {
        rowLabel += "|OTHER|READING";
      }
    }
  } else if (state.type == "test") {
    rowLabel += "|TEST|DO_TEST";
  } else if (state.type == "run") {
    rowLabel += "|RUN";
  } else if (state.type == "ws") {
    rowLabel += "|WS";
  }

  const data: GTimeChartData = {
    state: base.state,
    rowLabel: rowLabel,
    barLabel: base.barLabel,
    tooltip: base.tooltip,
    begin: base.begin,
    end: base.end,
    beginDate: base.state.datetimeStart,
    endDate: base.state.datetimeEnd,
  };
  return data;
}

async function createGoogleTimeChartDataForEdit(
  state: State,
  event: EditEvent
): Promise<GTimeChartData | undefined> {
  const fileName = event.fileName;
  const action = event.eventName.toString();

  // remove parameter part: like fileName?....
  let file = fileName.replace(/\?.*$/, "");
  if (file.match(/\.git$/) != null) {
    // exclude activities with *.java.git
    return undefined;
  }
  if (file.match(/\.class$/) != null) {
    // exclude activities with *.class
    return undefined;
  }

  // create categorized row label: Reading/Editting
  if (action == "onDidChangeTextDocument") {
    file += "|Editting";
  } else {
    file += "|Reading";
  }

  const timeChartData: GTimeChartData = {
    state: state,
    rowLabel: file,
    barLabel: action,
    tooltip: "",
    begin: state.estimateTimeStart,
    end: state.estimateTimeEnd,
    beginDate: state.datetimeStart,
    endDate: state.datetimeEnd,
  };
  return timeChartData;
}

async function appendGoogleTimeChartDataForTest(
  state: State,
  event: TestEvent,
  timeChartDataList: GTimeChartData[],
  jsonData: TestInfoByDate[],
  database: [string, string | null, boolean, number, number][],
  jsonDate: Date,
  passRatioPath: string,
  failedTestLifeTimeArray: [string, number][],
  timeLineDataForFailedTest: [string, number, number][]
) {
  //add
  if (!(event.invokedDate instanceof Date)) {
    event.invokedDate = new Date(event.invokedDate);
  }
  if (!(jsonDate instanceof Date)) {
    jsonDate = new Date(jsonDate);
  }
  while (event.invokedDate.getTime() > jsonDate.getTime()) {
    const index = jsonData.findIndex((entry) => entry.date == jsonDate);

    if (index != -1 && index + 1 < jsonData.length) {
      jsonDate = jsonData[index + 1].date;
    } else {
      console.log("json index error");
      break;
    }
  }
  let findItem = jsonData.find((item: TestInfoByDate) => item.date == jsonDate);
  if (!findItem) {
    console.error(`No data found data ${jsonDate}`);
    return;
  }
  let JsonTest: string[] = findItem.testNames;
  //database upgrade
  for (let i = database.length - 1; i >= 0; i--) {
    const [testName] = database[i];
    if (!JsonTest.includes(testName)) {
      database.splice(i, 1);
    }
  }
  for (const item of JsonTest) {
    if (!database.some(([testName]) => testName == item)) {
      database.push([item, null, false, 0, 0]);
    }
  }
  const regex = /\(.*?\)$/;
  const failedCase = event.failedCase.map((str) => str.replace(regex, ""));
  const testingCase = event.testingCase.map((str) => str.replace(regex, ""));

  for (const item of failedCase) {
    for (const data of database) {
      if (data[0] == item) {
        data[1] = "fail";
        if (data[2] == false) {
          data[2] = true;
          data[3] = state.estimateTimeStart;
        }
        break;
      }
    }
  }

  const passCase = testingCase.filter((item) => !failedCase.includes(item));
  for (const item of passCase) {
    for (const data of database) {
      if (data[0] == item) {
        data[1] = "pass";
        if (data[2] == true) {
          data[2] = false;
          data[4] = state.estimateTimeEnd;
          failedTestLifeTimeArray.push([data[0], data[4] - data[3]]);
          timeLineDataForFailedTest.push([data[0], data[3], data[4]]);
          data[3] = 0;
          data[4] = 0;
        }
        break;
      }
    }
  }
  const totalTests = database.length;
  const passedTests = database.filter(([_, result]) => result == "pass").length;
  const passRatio = (passedTests / totalTests) * 100;
  const passRatioData: [number, string] = [
    state.estimateTimeStart,
    totalTests > 0 ? passRatio.toFixed(2) : "0.00",
  ];
  const fileContent =
    passRatioData[0] + "," + passRatioData[1] + "," + totalTests + "\n";
  fs.appendFileSync(passRatioPath, fileContent, "utf8");

  let barLabel = Math.round(event.passRatio) + "%";
  barLabel +=
    "( failed: " +
    event.failedCase.length +
    " of " +
    event.testingCase.length +
    ")";
  let rowLabel = "#DO_TEST";
  if (event.invokedTestType == "$(symbol-method)") {
    rowLabel += "|METHOD";
  } else {
    if (event.testTree.length == 1) {
      rowLabel += "|CLASS_1";
    } else {
      rowLabel += "|CLASS_N";
    }
  }

  if (event.passRatio == 100) {
    rowLabel += "|ALLPASS";
  } else {
    rowLabel += "|WITHFAIL";
  }
  const timeChartData: GTimeChartData = {
    state: state,
    rowLabel: rowLabel,
    barLabel: barLabel,
    tooltip: "",
    begin: state.estimateTimeStart,
    end: state.estimateTimeEnd,
    beginDate: state.datetimeStart,
    endDate: state.datetimeEnd,
  };
  timeChartDataList.push(timeChartData);
  timeChartDataList.push(await getSummaryData(timeChartData));

  for (const treeNode of event.testTree) {
    const testClassName = await getFileNameFromDotPath(treeNode.testClassName);
    const failedTestNum = treeNode.testMethodNameList.filter((item) =>
      event.failedCase.includes(item)
    ).length;
    const passRatio =
      100 *
      ((treeNode.testMethodNameList.length - failedTestNum) /
        treeNode.testMethodNameList.length);
    let barStr =
      Math.round(passRatio) +
      "%" +
      "( failed: " +
      failedTestNum +
      " of " +
      treeNode.testMethodNameList.length +
      " )";
    const timeChartData: GTimeChartData = {
      state: state,
      rowLabel: testClassName,
      barLabel: barStr,
      tooltip: "",
      begin: state.estimateTimeStart,
      end: state.estimateTimeEnd,
      beginDate: state.datetimeStart,
      endDate: state.datetimeEnd,
    };

    if (timeChartData != null) {
      timeChartDataList.push(timeChartData);
      timeChartDataList.push(await getSummaryData(timeChartData));
    }
    for (const testCase of treeNode.testMethodNameList) {
      const rowLabel =
        testClassName +
        "->" +
        testCase.replace(treeNode.testClassName.toString(), "");
      let barStr = "PASS";
      if (event.failedCase.includes(testCase)) {
        barStr = "FAIL";
      }

      const timeChartData: GTimeChartData = {
        state: state,
        rowLabel: rowLabel,
        barLabel: barStr,
        tooltip: "",
        begin: state.estimateTimeStart,
        end: state.estimateTimeEnd,
        beginDate: state.datetimeStart,
        endDate: state.datetimeEnd,
      };

      if (timeChartData != null) {
        timeChartDataList.push(timeChartData);
        timeChartDataList.push(await getSummaryData(timeChartData));
      }
    }
  }
}
async function createGoogleTimeChartDataForRun(
  state: State,
  event: RunEvent
): Promise<GTimeChartData | undefined> {
  const rowLabel = "#RUN|" + event.name;
  const timeChartData: GTimeChartData = {
    state: state,
    rowLabel: rowLabel,
    barLabel: event.name,
    tooltip: "",
    begin: state.estimateTimeStart,
    end: state.estimateTimeEnd,
    beginDate: state.datetimeStart,
    endDate: state.datetimeEnd,
  };
  return timeChartData;
}

async function createGoogleTimeChartDataForWS(
  state: State,
  event: WSEvent
): Promise<GTimeChartData | undefined> {
  const rowLabel = "#WS|LINENO";
  const timeChartData: GTimeChartData = {
    state: state,
    rowLabel: rowLabel,
    barLabel: event.lineNo.toString(),
    tooltip: "",
    begin: state.estimateTimeStart,
    end: state.estimateTimeEnd,
    beginDate: state.datetimeStart,
    endDate: state.datetimeEnd,
  };
  return timeChartData;
}
async function convertGoogleTimeChartData(
  stateList: State[],
  options: any,
  id: String,
  session: String
): Promise<String> {
  let cycleStartDate: number = 0;
  let cycleEndTime: number = 0;
  let cycleFlag: string = "0"; //1 is testCode edit,run,  2 is productCode edit, 3 is testCode run
  const cycleDataList: [string, string, number, number][] = [];
  const jsonPath = "./output/testInfoByDate/" + id + "testInfoByDate.json";
  const data = fs.readFileSync(jsonPath, "utf8");
  const jsonData = JSON.parse(data);
  const sessionData: TestInfoByDate[] = jsonData
    .find((item: TestInfoBySid) => item.sid == session)
    ?.info.map((entry: TestInfoByDate) => ({
      ...entry,
      date: new Date(entry.date),
    }));
  const failedTestLifeTimeArray: [string, number][] = [];
  const timeLineDataForFailedTest: [string, number, number][] = [];
  let database: [string, string | null, boolean, number, number][] = [];
  const timeChartDataList: GTimeChartData[] = [];
  let jsonDate: Date =
    sessionData && sessionData.length > 0 ? sessionData[0].date : new Date();
  const passRatioPath = `./output/passRatio/${id}/${session}passRatio.txt`;
  fs.mkdirSync(path.dirname(passRatioPath), { recursive: true });
  if (fs.existsSync(passRatioPath)) {
    fs.unlinkSync(passRatioPath);
  }

  for (const state of stateList) {
    let rowLabel = "";
    let barLabel = "";
    if (!(state.type == "test") && cycleFlag == "3") {
      cycleDataList.push([
        "'TestFirstDuration'",
        "''",
        cycleStartDate,
        cycleEndTime,
      ]);
      cycleFlag = "0";
      cycleStartDate = 0;
      cycleEndTime = 0;
    }
    if (state.type == "edit") {
      const event: EditEvent = state.info as EditEvent;
      if (cycleFlag == "1" && isProductCode(event.filePath)) {
        cycleFlag = "2";
      } else if (cycleFlag == "2" && !isProductCode(event.filePath)) {
        //readingは許容するようにする
        if (event.eventName.toString() == "onDidChangeTextDocument") {
          cycleFlag = "0";
          cycleStartDate = 0;
        }
      } else if (cycleFlag == "0" && isTestCode(event.filePath)) {
        cycleStartDate = state.estimateTimeStart;
        if (!(cycleStartDate > 0)) {
          console.log("error cycleStartDate");
        }
        cycleFlag = "1";
      }
      const timeChartData = await createGoogleTimeChartDataForEdit(
        state,
        event
      );
      if (timeChartData != null) {
        timeChartDataList.push(timeChartData);
        timeChartDataList.push(await getSummaryData(timeChartData));
      }
    } else if (state.type == "test") {
      const event: TestEvent = state.info as TestEvent;
      if (cycleFlag == "0") {
        cycleStartDate = state.estimateTimeStart;
        cycleFlag = "1";
      } else if (cycleFlag == "2") {
        cycleEndTime = state.estimateTimeEnd;
        cycleFlag = "3";
      }
      await appendGoogleTimeChartDataForTest(
        state,
        event,
        timeChartDataList,
        sessionData,
        database,
        jsonDate,
        passRatioPath,
        failedTestLifeTimeArray,
        timeLineDataForFailedTest
      );
    } else if (state.type == "run") {
      const event: RunEvent = state.info as RunEvent;
      const timeChartData = await createGoogleTimeChartDataForRun(state, event);
      if (timeChartData != null) {
        timeChartDataList.push(timeChartData);
        timeChartDataList.push(await getSummaryData(timeChartData));
      }
    } else if (state.type == "ws") {
      const event: WSEvent = state.info as WSEvent;
      const timeChartData = await createGoogleTimeChartDataForWS(state, event);
      if (timeChartData != null) {
        timeChartDataList.push(timeChartData);
        timeChartDataList.push(await getSummaryData(timeChartData));
      }
    }
  }
  const failedTestLifeTimePath = `./output/failedTestLifeTime/${id}/${session}failedTestLifeTime.txt`;
  const timelinePath = `./output/failedTestLifeTime/${id}/${session}timeline.txt`;
  if (!fs.existsSync(failedTestLifeTimePath)) {
    fs.mkdirSync(path.dirname(failedTestLifeTimePath), { recursive: true });
  }
  if (!fs.existsSync(timelinePath)) {
    fs.mkdirSync(path.dirname(timelinePath), { recursive: true });
  }
  const sortedTop10: [string, string][] = Array.from(
    new Map<string, number>(
      failedTestLifeTimeArray
        .sort((a, b) => b[1] - a[1])
        .reduce((map, [testName, ms]) => {
          if (!map.has(testName) || map.get(testName)! < ms) {
            map.set(testName, ms);
          }
          return map;
        }, new Map<string, number>())
    )
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([testName, ms]) => [testName, (ms / 60000).toFixed(2)]);
  const top10TestNames = sortedTop10.map(([testName]) => testName);
  const filteredTimeLineData = timeLineDataForFailedTest
    .filter((data) => top10TestNames.includes(data[0]))
    .sort(
      ([, start1, end1], [, start2, end2]) => end2 - start2 - (end1 - start1)
    );
  const result = sortedTop10.join("\n");
  fs.writeFileSync(failedTestLifeTimePath, result, "utf8");
  fs.writeFileSync(timelinePath, JSON.stringify(filteredTimeLineData), "utf8");
  let convertResult = await convertGoogleTimeChartString(
    timeChartDataList,
    options
  );
  convertResult = convertResult.slice(0, -1);
  for (const item of cycleDataList) {
    convertResult += ",[" + item.toString() + "]\n";
  }
  convertResult += "];";
  return convertResult;
}
/**
 * convert GTimeChartDate[] to Code String as Data in JavaScript Code
 *
 * @param timeChartDataList
 * @param options Time Format in timechart: 'estimate' or 'date'
 * @returns
 */
async function convertGoogleTimeChartString(
  timeChartDataList: GTimeChartData[],
  options: any
): Promise<String> {
  timeChartDataList.sort((a: GTimeChartData, b: GTimeChartData) => {
    const ax = a.rowLabel.toUpperCase();
    const bx = b.rowLabel.toUpperCase();
    if (ax > bx) {
      return 1;
    } else if (ax == bx) {
      return 0;
    } else {
      return -1;
    }
  });

  let begin: boolean = true;
  let data: String = "[";
  for (const t of timeChartDataList) {
    if (begin != true) {
      data += ",\n";
    }
    begin = false;
    data += "[";
    data += "'" + t.rowLabel + "', ";
    data += "'" + t.barLabel + "', ";
    if (options.timeFormat == "estimate") {
      data += t.begin + ", ";
      data += "" + t.end;
    } else {
      // e.g., new Date(1789, 3, 30, 12, 1, 0)
      data +=
        "new Date(" +
        t.beginDate.getFullYear() +
        "," +
        t.beginDate.getMonth() +
        "," +
        t.beginDate.getDay() +
        "," +
        t.beginDate.getHours() +
        "," +
        t.beginDate.getMinutes() +
        "," +
        t.beginDate.getSeconds() +
        "), ";
      data +=
        "new Date(" +
        t.endDate.getFullYear() +
        "," +
        t.endDate.getMonth() +
        "," +
        t.endDate.getDay() +
        "," +
        t.endDate.getHours() +
        "," +
        t.endDate.getMinutes() +
        "," +
        t.endDate.getSeconds() +
        "), ";
    }
    data += "]";
  }
  data += "\n]";

  return data;
}
export async function createGoogleTimeChart(
  header: string,
  stateList: State[],
  options: any,
  templatePath: string,
  chartFilePath: string,
  id: String,
  session: String
) {
  try {
    const heaerReplacePattern = "##%%$$HEADER$$%%##";
    const dataReplacePattern = "##%%$$DATA$$%%##";
    let chartData: String = await convertGoogleTimeChartData(
      stateList,
      options,
      id,
      session
    );
    const template = await fs.readFile(templatePath);
    let chartHTML = template
      .toString()
      .replace(dataReplacePattern, chartData.toString());
    chartHTML = chartHTML.replace(heaerReplacePattern, header);
    fs.ensureFileSync(chartFilePath);
    fs.writeFile(chartFilePath, chartHTML);
  } catch (error: any) {
    console.error(`Error: createGoogleTimeChart(): ${error.message}`);
  }
}
