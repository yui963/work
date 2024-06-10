import * as fs from "fs-extra";
import * as ss from "simple-statistics";
import { State } from "./State";
import { TestEvent, TestTree } from "./analyzeTestResults";
import { EditEvent } from "./analyzeEditActivity";
import { RunEvent } from "./analyzeRunResults";
import { isProductCode, isTestCode } from "./common";
import { WSEvent } from "./analyzeWS";
import { StateInfo, stateInfoJsonPath } from "./analyzeStateInfo";
import {
  outputAllIndicators,
  indicatorsInfo,
  outputIndicatorsByIndicatorType,
} from "./outputIndicators";
import path from "path";
import { start } from "repl";

/**
 * Calculate some indicators
 *
 * @param stateList
 * @returns
 */
export async function calcIndicator(
  stateList: State[],
  id: string
): Promise<any> {
  let info = {};
  const editActivityInfo = calcEditActivity(stateList);
  const runActivityInfo = calcRunActivity(stateList);
  const testActivityInfo = calcTestActivity(stateList, id);
  const wsHistInfo = calcWSHistory(stateList);
  const failedTestLifeTimeInfo = calcFailedTestLifeTime(stateList);
  const untestedTimeBeforeEditInfo = calcUntestedTimeBeforeEdit(stateList, id);
  const untestedTimeAfterEditInfo = calcUntestedTimeAfterEdit(stateList, id);
  const IntervalFirstSuccessTestInfo = calcInterval(stateList);
  return Object.assign(
    info,
    await editActivityInfo,
    await runActivityInfo,
    await testActivityInfo,
    await wsHistInfo,
    await failedTestLifeTimeInfo,
    await untestedTimeBeforeEditInfo,
    await untestedTimeAfterEditInfo,
    await IntervalFirstSuccessTestInfo
  );
}

async function calcWSHistory(stateList: State[]): Promise<any> {
  let info = {
    "COUNT|LINENO|MAX": 0,
    "COUNT|LINENO|MIN": 0,
    "COUNT|FILENO|MAX": 0,
    "COUNT|FILENO|MIN": 0,
    "COUNT|LINENO|PRODUCT|MAX": 0,
    "COUNT|LINENO|PRODUCT|MIN": 0,
    "COUNT|FILENO|PRODUCT|MAX": 0,
    "COUNT|FILENO|PRODUCT|MIN": 0,
    "COUNT|LINENO|TEST|MAX": 0,
    "COUNT|LINENO|TEST|MIN": 0,
    "COUNT|FILENO|TEST|MAX": 0,
    "COUNT|FILENO|TEST|MIN": 0,
    "COUNT|TESTCASE|MAX": 0,
    "COUNT|TESTCASE|MIN": 0,
  };

  const lineNo: number[] = [];
  const fileNo: number[] = [];
  const productLineNo: number[] = [];
  const productFileNo: number[] = [];
  const testLineNo: number[] = [];
  const testFileNo: number[] = [];
  const testCaseNo: number[] = [];

  for (const state of stateList) {
    if (state.type == "ws") {
      const event: WSEvent = state.info as WSEvent;
      lineNo.push(event.lineNo);
      fileNo.push(event.fileNo);
      productLineNo.push(event.main.lineNo);
      productFileNo.push(event.main.fileNo);
      testLineNo.push(event.test.lineNo);
      testFileNo.push(event.test.fileNo);
      testCaseNo.push(event.test.testCaseNo);
    }
  }

  if (lineNo.length == 0) {
    return info;
  }

  info = {
    "COUNT|LINENO|MAX": ss.max(lineNo),
    "COUNT|LINENO|MIN": ss.min(lineNo),
    "COUNT|FILENO|MAX": ss.max(fileNo),
    "COUNT|FILENO|MIN": ss.min(fileNo),
    "COUNT|LINENO|PRODUCT|MAX": ss.max(productLineNo),
    "COUNT|LINENO|PRODUCT|MIN": ss.min(productLineNo),
    "COUNT|FILENO|PRODUCT|MAX": ss.max(productFileNo),
    "COUNT|FILENO|PRODUCT|MIN": ss.min(productFileNo),
    "COUNT|LINENO|TEST|MAX": ss.max(testLineNo),
    "COUNT|LINENO|TEST|MIN": ss.min(testLineNo),
    "COUNT|FILENO|TEST|MAX": ss.max(testFileNo),
    "COUNT|FILENO|TEST|MIN": ss.min(testFileNo),
    "COUNT|TESTCASE|MAX": ss.max(testCaseNo),
    "COUNT|TESTCASE|MIN": ss.min(testCaseNo),
  };
  return info;
}

async function calcEditActivity(stateList: State[]): Promise<any> {
  let info = {
    "COUNT|EDIT": 0,
    "COUNT|EDIT|READING|PRODUCT": 0,
    "COUNT|EDIT|EDITTING|PRODUCT": 0,
    "COUNT|EDIT|READING|TEST": 0,
    "COUNT|EDIT|EDITTING|TEST": 0,
    "COUNT|EDIT|READING|OTHER": 0,
    "COUNT|EDIT|EDITTING|OTHER": 0,
    "TIME|EDIT": 0, // miliseconds
    "TIME|EDIT|READING|PRODUCT": 0,
    "TIME|EDIT|EDITTING|PRODUCT": 0,
    "TIME|EDIT|READING|TEST": 0,
    "TIME|EDIT|EDITTING|TEST": 0,
    "TIME|EDIT|READING|OTHER": 0,
    "TIME|EDIT|EDITTING|OTHER": 0,
    "TIME|EDIT|RATIO|PRODUCT": 0,
    "TIME|EDIT|RATIO|TEST": 0,
    "TIME|EDIT|RATIO|OTHER": 0,
  };

  for (const state of stateList) {
    if (state.type == "edit") {
      const event: EditEvent = state.info as EditEvent;
      info["COUNT|EDIT"]++;
      info["TIME|EDIT"] += state.duration;
      if (event.eventName == "onDidChangeTextDocument") {
        //編集中
        if (isProductCode(event.filePath)) {
          info["COUNT|EDIT|EDITTING|PRODUCT"]++;
          info["TIME|EDIT|EDITTING|PRODUCT"] += state.duration;
        } else if (isTestCode(event.filePath)) {
          info["COUNT|EDIT|EDITTING|TEST"]++;
          info["TIME|EDIT|EDITTING|TEST"] += state.duration;
        } else {
          info["COUNT|EDIT|EDITTING|OTHER"]++;
          info["TIME|EDIT|EDITTING|OTHER"] += state.duration;
        }
      } else {
        //眺めている中
        if (isProductCode(event.filePath)) {
          info["COUNT|EDIT|READING|PRODUCT"]++;
          info["TIME|EDIT|READING|PRODUCT"] += state.duration;
        } else if (isTestCode(event.filePath)) {
          info["COUNT|EDIT|READING|TEST"]++;
          info["TIME|EDIT|READING|TEST"] += state.duration;
        } else {
          info["COUNT|EDIT|READING|OTHER"]++;
          info["TIME|EDIT|READING|OTHER"] += state.duration;
        }
      }
    }
  }

  const totalTime = info["TIME|EDIT"];
  const productTime =
    info["TIME|EDIT|READING|PRODUCT"] + info["TIME|EDIT|EDITTING|PRODUCT"];
  const testTime =
    info["TIME|EDIT|READING|TEST"] + info["TIME|EDIT|EDITTING|TEST"];
  const otherTime =
    info["TIME|EDIT|READING|OTHER"] + info["TIME|EDIT|EDITTING|OTHER"];
  info["TIME|EDIT|RATIO|PRODUCT"] = (productTime / totalTime) * 100;
  info["TIME|EDIT|RATIO|TEST"] = (testTime / totalTime) * 100;
  info["TIME|EDIT|RATIO|OTHER"] = (otherTime / totalTime) * 100;

  return info;
}

/**
 * Calculate time from editting to testing
 *
 * Term From 'Editting' to 'Testing'
 *           T                        T
 * ERRRRRRRRR ERREEEEEEEERRRRRRRRRRRRR EEEE
 * @<-  9  ->           @<-   13    ->

 * @param stateList
 * @returns
 */
async function calcUntestedTimeAfterEdit(
  stateList: State[],
  id: string
): Promise<any> {
  let untestedTimeList: number[] = [];
  let isUnTestedTime = true;
  let untestedTime = 0;
  for (const state of stateList) {
    if (state.type == "edit") {
      const event: EditEvent = state.info as EditEvent;
      if (
        event.eventName == "onDidChangeTextDocument" &&
        isProductCode(event.filePath)
      ) {
        isUnTestedTime = true;
        untestedTime = 0; // 最終Editにする
      }
    } else if (state.type == "test") {
      untestedTimeList.push(untestedTime);
      untestedTime = 0;
      isUnTestedTime = false;
    }

    if (isUnTestedTime) {
      untestedTime += state.duration;
    }
  }

  try {
    let info = {
      "I|UNTESTED_TIME_AFTER_EDIT|COUNT": untestedTimeList.length,
      "I|UNTESTED_TIME_AFTER_EDIT|TOTAL": ss.sum(untestedTimeList),
      "I|UNTESTED_TIME_AFTER_EDIT|AVG": ss.mean(untestedTimeList),
      "I|UNTESTED_TIME_AFTER_EDIT|STD": ss.standardDeviation(untestedTimeList),
      "I|UNTESTED_TIME_AFTER_EDIT|MAX": ss.max(untestedTimeList),
      "I|UNTESTED_TIME_AFTER_EDIT|MIN": ss.min(untestedTimeList),
    };
    return info;
  } catch (error: any) {
    console.log(`Error: calcUntestedTimeAfterEdit(): id:${id} I`);
    let info = {
      "I|UNTESTED_TIME_AFTER_EDIT|COUNT": untestedTimeList.length,
      "I|UNTESTED_TIME_AFTER_EDIT|TOTAL": -10,
      "I|UNTESTED_TIME_AFTER_EDIT|AVG": -10,
      "I|UNTESTED_TIME_AFTER_EDIT|STD": -10,
      "I|UNTESTED_TIME_AFTER_EDIT|MAX": -10,
      "I|UNTESTED_TIME_AFTER_EDIT|MIN": -10,
    };
    return info;
  }
}

/**
 * Calculate time from testing to editting
 *
 * Term from 'Testing' to 'Editting'
 * T             T
 *  RRRRRRRRREREE RRRRRRRRREEERE
 *  <-  9  ->@    <-  9  ->@
 *
 * @param stateList
 * @returns
 */
async function calcUntestedTimeBeforeEdit(
  stateList: State[],
  id: string
): Promise<any> {
  let untestedTimeList: number[] = [];
  let isUnTestedTime = true;
  let untestedTime = 0;
  for (const state of stateList) {
    if (state.type == "edit") {
      const event: EditEvent = state.info as EditEvent;
      if (
        event.eventName == "onDidChangeTextDocument" &&
        isProductCode(event.filePath)
      ) {
        untestedTimeList.push(untestedTime);
        untestedTime = 0;
        isUnTestedTime = false;
      }
    } else if (state.type == "test") {
      isUnTestedTime = true;
      untestedTime = 0;
    }

    if (isUnTestedTime) {
      untestedTime += state.duration;
    }
  }

  try {
    let info = {
      "I|UNTESTED_TIME_BEFORE_EDIT|COUNT": untestedTimeList.length,
      "I|UNTESTED_TIME_BEFORE_EDIT|TOTAL": ss.sum(untestedTimeList),
      "I|UNTESTED_TIME_BEFORE_EDIT|AVG": ss.mean(untestedTimeList),
      "I|UNTESTED_TIME_BEFORE_EDIT|STD": ss.standardDeviation(untestedTimeList),
      "I|UNTESTED_TIME_BEFORE_EDIT|MAX": ss.max(untestedTimeList),
      "I|UNTESTED_TIME_BEFORE_EDIT|MIN": ss.min(untestedTimeList),
    };
    return info;
  } catch (error: any) {
    let info = {
      "I|UNTESTED_TIME_BEFORE_EDIT|COUNT": untestedTimeList.length,
      "I|UNTESTED_TIME_BEFORE_EDIT|TOTAL": ss.sum(untestedTimeList),
      "I|UNTESTED_TIME_BEFORE_EDIT|AVG": -10,
      "I|UNTESTED_TIME_BEFORE_EDIT|STD": -10,
      "I|UNTESTED_TIME_BEFORE_EDIT|MAX": -10,
      "I|UNTESTED_TIME_BEFORE_EDIT|MIN": -10,
    };
    return info;
  }
}

async function calcRunActivity(stateList: State[]): Promise<any> {
  let info = {
    "COUNT|RUN": 0,
    "COUNT|RUN|KIND": 0,
    "TIME|RUN": 0, // miliseconds
  };

  let kind: any = {};
  for (const state of stateList) {
    if (state.type == "run") {
      const event: RunEvent = state.info as RunEvent;
      info["COUNT|RUN"]++;
      info["TIME|RUN"] += state.duration;
      kind[event.name.toString()] = true;
    }
  }
  info["COUNT|RUN|KIND"] = Object.keys(kind).length;
  return info;
}

async function calcTestActivity(stateList: State[], id: string): Promise<any> {
  let info = {
    "COUNT|TEST|TESTING_TIME": 0,
    "COUNT|TEST|TESTING_CASE": 0,
    "COUNT|TEST|SELECT_TESTING_TIME": 0,
    "COUNT|TEST|SELECT_TESTING_CASE": 0,
    "COUNT|TEST|SELECT_TESTING_CASE|AVG": 0,
    "COUNT|TEST|SELECT_TESTING_CASE|VAR": 0,
    "COUNT|TEST|SELECT_TESTING_CASE|STD": 0,
    "COUNT|TEST|TESTING_BY_METHOD": 0,
    "COUNT|TEST|TESTING_BY_CLASS": 0,
  };

  let testingCaseNumList: number[] = [];
  for (const state of stateList) {
    if (state.type == "test") {
      const event: TestEvent = state.info as TestEvent;
      testingCaseNumList.push(event.testingCase.length);
      if (event.invokedTestType == "$(symbol-method)") {
        info["COUNT|TEST|TESTING_BY_METHOD"]++;
      } else if (event.invokedTestType == "$(symbol-class)") {
        info["COUNT|TEST|TESTING_BY_CLASS"]++;
      }
    }
  }

  try {
    info["COUNT|TEST|TESTING_TIME"] = testingCaseNumList.length;
    info["COUNT|TEST|TESTING_CASE"] = ss.sum(testingCaseNumList);
    const withoutAllTestingCase = testingCaseNumList.filter((v: number) => {
      return v < 50;
    });

    info["COUNT|TEST|SELECT_TESTING_TIME"] = withoutAllTestingCase.length;
    info["COUNT|TEST|SELECT_TESTING_CASE"] = ss.sum(withoutAllTestingCase);
    info["COUNT|TEST|SELECT_TESTING_CASE|AVG"] = ss.mean(withoutAllTestingCase);
    info["COUNT|TEST|SELECT_TESTING_CASE|VAR"] = ss.variance(
      withoutAllTestingCase
    );
    info["COUNT|TEST|SELECT_TESTING_CASE|STD"] = ss.standardDeviation(
      withoutAllTestingCase
    );

    return info;
  } catch (error: any) {
    console.log(`Error: calcTestActivity(): count ${id}`);
    info["COUNT|TEST|TESTING_TIME"] = testingCaseNumList.length;
    info["COUNT|TEST|TESTING_CASE"] = -10;
    const withoutAllTestingCase = testingCaseNumList.filter((v: number) => {
      return v < 50;
    });
    info["COUNT|TEST|SELECT_TESTING_TIME"] = withoutAllTestingCase.length;
    info["COUNT|TEST|SELECT_TESTING_CASE"] = -10;
    info["COUNT|TEST|SELECT_TESTING_CASE|AVG"] = -10;
    info["COUNT|TEST|SELECT_TESTING_CASE|VAR"] = -10;
    info["COUNT|TEST|SELECT_TESTING_CASE|STD"] = -10;
    return info;
  }
}

/**
 * Calculate Time which is after a test was failed until the test passed.
 *
 * @param stateList
 * @returns
 */
const excludingTestNameList: string[] = ["testMustBeFailed"];
async function calcFailedTestLifeTime(stateList: State[]): Promise<any> {
  let failedTest: any = {};
  let failedTestLifeTime: number[] = [];
  for (const state of stateList) {
    if (state.type == "test") {
      const event: TestEvent = state.info as TestEvent;
      for (const name of event.failedCase) {
        //failedTestに未登録であれば日時と名前を登録
        const failedTestName = name.toString();
        if (
          excludingTestNameList.includes(failedTestName) == false &&
          failedTestName in failedTest == false
        ) {
          failedTest[name.toString()] = event.invokedDate;
        }
      }

      const passCase = event.testingCase.filter((v: String) => {
        return !event.failedCase.includes(v);
      });
      for (const item of Object.keys(failedTest)) {
        if (passCase.includes(item)) {
          const passDate = new Date(event.invokedDate);
          const failDate = new Date(failedTest[item]);
          const duration = passDate.getTime() - failDate.getTime();
          failedTestLifeTime.push(duration);
          delete failedTest[item];
        }
      }
    }
  }

  let info = {
    "I|FAILED_TEST_LIFETIME|FIX_COUNT": 0,
    "I|FAILED_TEST_LIFETIME|TOTAL": 0,
    "I|FAILED_TEST_LIFETIME|AVG": 0,
    "I|FAILED_TEST_LIFETIME|STD": 0,
    "I|FAILED_TEST_LIFETIME|MAX": 0,
    "I|FAILED_TEST_LIFETIME|MIN": 0,
    "I|FAILED_TEST_LIFETIME|FAILED_END": 0,
  };

  if (failedTestLifeTime.length > 0) {
    info["I|FAILED_TEST_LIFETIME|FIX_COUNT"] = failedTestLifeTime.length;
    info["I|FAILED_TEST_LIFETIME|TOTAL"] = ss.sum(failedTestLifeTime);
    info["I|FAILED_TEST_LIFETIME|AVG"] = ss.mean(failedTestLifeTime);
    info["I|FAILED_TEST_LIFETIME|STD"] =
      ss.standardDeviation(failedTestLifeTime);
    info["I|FAILED_TEST_LIFETIME|MAX"] = ss.max(failedTestLifeTime);
    info["I|FAILED_TEST_LIFETIME|MIN"] = ss.min(failedTestLifeTime);
  }
  info["I|FAILED_TEST_LIFETIME|FAILED_END"] = Object.keys(failedTest).length;

  return info;
}

//初めて成功したテストの最大発生間隔を求める
//テストが初めて成功したときの要求時刻を配列にまとめてから、最大を求める
async function calcInterval(
  stateList: State[]
): Promise<{ [name: string]: number }> {
  let maxInterval: number = 0;
  let intervalList: { [name: string]: number } = { MAXInterval: maxInterval };
  let failedTestList: string[] = [];
  let passedTestList: string[] = [];
  let isFirstFound: boolean = false;
  let prevPassDate: number = 0;
  for (const state of stateList) {
    if (!isFirstFound) {
      let startDate: Date = createStartDate(state);
      isFirstFound = true;
      prevPassDate = startDate.getTime(); //初期は開始時刻
    }

    if (state.type == "test") {
      const event: TestEvent = state.info as TestEvent;
      for (const name of event.failedCase) {
        const failedTestName: string = name.toString();
        if (
          excludingTestNameList.includes(failedTestName) == false &&
          failedTestList.includes(failedTestName) == false
        ) {
          failedTestList.push(name.toString());
        }
      }
      const passCase = event.testingCase.filter((v: String) => {
        return !event.failedCase.includes(v);
      });
      for (const name of failedTestList) {
        if (passCase.includes(name) && !passedTestList.includes(name)) {
          intervalList[name];
          passedTestList.push(name);
          const invokedDate = new Date(event.invokedDate);
          const passDate: number = invokedDate.getTime();
          // console.log(passDate);
          const interval = passDate - prevPassDate;
          // console.log(name + "//" + passDate + "//" + prevPassDate);
          intervalList[name] = interval;
          prevPassDate = passDate;
          if (maxInterval < interval) {
            maxInterval = interval;
            intervalList["MAXInterval"] = maxInterval;
          }
        }
      }
    }
  }
  // console.log(intervalList);
  return intervalList;
}
function createStartDate(state: State): Date {
  let startDate: Date = new Date();
  if (state.type == "ws") {
    const event: WSEvent = state.info as WSEvent;
    startDate = new Date(event.date);
  } else if (state.type == "edit") {
    const event: EditEvent = state.info as EditEvent;
    startDate = new Date(event.datetime);
  } else if (state.type == "test") {
    const event: TestEvent = state.info as TestEvent;
    startDate = new Date(event.invokedDate);
  } else if (state.type == "run") {
    const event: RunEvent = state.info as RunEvent;
    startDate = new Date(event.invokedDate);
  } else {
    console.error("Error: Start date is null.");
  }
  return startDate;
}

//各セッションごとに処理
export async function calcAllIndicators() {
  const jsonOutputPath = path.join(process.cwd(), "output");
  const entries = await fs.readdir(jsonOutputPath, { withFileTypes: true });
  const jsonFileList = entries
    .filter((entry) => entry.name.endsWith(".json"))
    .map((entry) => entry.name);

  const resultIndicators: any = {};
  for (const jsonFile of jsonFileList) {
    const stateInfoJsonPath = path.join(jsonOutputPath, jsonFile);
    const stateInfoJsonBuffer = fs.readFileSync(stateInfoJsonPath);
    const stateInfoJson = JSON.parse(stateInfoJsonBuffer.toString());
    const stateInfoArray = stateInfoJson.data;

    for (const item of stateInfoArray) {
      const stateInfo = item as StateInfo;
      const id = stateInfo.id.toString();
      const session = stateInfo.session.toString();
      console.log(
        "Calculate Indicators for ID: " + id + " Session: " + session
      );

      const indicators = await calcIndicator(stateInfo.stateList, id);
      const indicatorsInfo: indicatorsInfo = {
        id: stateInfo.id,
        session: stateInfo.session,
        indicators: indicators,
      };

      if (!(id in resultIndicators)) {
        resultIndicators[id] = {};
      }
      resultIndicators[stateInfo.id.toString()][stateInfo.session.toString()] =
        indicatorsInfo;
    }
  }
  // console.log(resultIndicators);
  outputAllIndicators(resultIndicators);
  outputIndicatorsByIndicatorType(resultIndicators);
}

if (typeof require !== "undefined" && require.main === module) {
  calcAllIndicators();
}
