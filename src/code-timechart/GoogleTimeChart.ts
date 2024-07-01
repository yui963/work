import * as fs from "fs-extra";
import { State } from "./State";
import { TestEvent, TestTree } from "./analyzeTestResults";
import { EditEvent } from "./analyzeEditActivity";
import { RunEvent } from "./analyzeRunResults";
import { WSEvent } from "./analyzeWS";
import { getFileNameFromDotPath, isProductCode, isTestCode } from "./common";
import { join, dirname } from "path";
import { existsSync } from "fs";
import { time } from "console";

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
interface MadeTestList {
  name: String;
  pass: String;
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
  madeTestCases: MadeTestList[]
) {
  {
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
  }

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
      //以下追加
      // const madeTestCases: String[] = getMadeTestCases();
      const name: String[] = madeTestCases.map((item) => item.name);
      if (
        !name.includes(testCase.replace(/\(.*\)/, "")) &&
        !testCase.includes("@ignore")
      ) {
        madeTestCases.push({ name: testCase.replace(/\(.*\)/, ""), pass: "" });

        const num: number = madeTestCases.length;
        const rowLabel = "TestCasesNum";
        const timeChartData: GTimeChartData = {
          state: state,
          rowLabel: rowLabel,
          barLabel: num.toString(),
          tooltip: "",
          begin: state.estimateTimeStart,
          end: state.estimateTimeEnd,
          beginDate: state.datetimeStart,
          endDate: state.datetimeEnd,
        };
        timeChartDataList.push(timeChartData);
      }
      // setMadeTestCases(madeTestCases);
    }
    const failedTestList = treeNode.testMethodNameList.filter((item) =>
      event.failedCase.includes(item)
    );
    const passedTestList = treeNode.testMethodNameList.filter(
      (item) => !event.failedCase.includes(item)
    );
    for (const name of failedTestList) {
      madeTestCases.map((item) => {
        if (name.replace(/\(.*\)/, "") == item.name) {
          item.pass = "fail";
        }
      });
    }
    for (const name of passedTestList) {
      madeTestCases.map((item) => {
        if (name.replace(/\(.*\)/, "") == item.name) {
          item.pass = "pass";
        }
      });
    }
  }
  let passNum: number = 0;
  madeTestCases.map((item) => {
    if (item.pass == "pass") {
      passNum += 1;
    }
  });
  console.log(Math.round((passNum / madeTestCases.length) * 100) + "%");
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
  options: any
): Promise<String> {
  const timeChartDataList: GTimeChartData[] = [];

  let madeTestList: MadeTestList[] = [];
  for (const state of stateList) {
    let rowLabel = "";
    let barLabel = "";

    if (state.type == "edit") {
      const event: EditEvent = state.info as EditEvent;
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
      await appendGoogleTimeChartDataForTest(
        state,
        event,
        timeChartDataList,
        madeTestList
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
  return await convertGoogleTimeChartString(timeChartDataList, options);
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
  chartFilePath: string
) {
  try {
    const heaerReplacePattern = "##%%$$HEADER$$%%##";
    const dataReplacePattern = "##%%$$DATA$$%%##";
    let chartData: String = await convertGoogleTimeChartData(
      stateList,
      options
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
