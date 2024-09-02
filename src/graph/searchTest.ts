import { kMaxLength } from "buffer";
import * as fs from "fs";
import * as path from "path";
import { testRunInfoJsonPath } from "./../code-timechart/calcIndicator";
interface TestCaseModel {
  sid: number;
  num: number;
  testNames: string[];
}
export interface TestInfoByDate {
  date: Date;
  testNames: string[];
}
export interface TestInfoBySid {
  sid: string;
  info: TestInfoByDate[];
}
function searchTestNames(
  path: string,
  testNames: string[],
  madeTest: string[]
): void {
  let flag: boolean = false;
  let comment: boolean = false;
  const content = fs.readFileSync(path, "utf-8");
  const lines = content.split("\n");
  let skipLine = 0;
  //\*だけで1行という前提
  for (const line of lines) {
    if (skipLine > 0) {
      skipLine--;
      continue;
    }
    if (line.includes("@ignore")) {
      skipLine = 1;
      continue;
    }
    if (line.includes("/*")) {
      comment = true;
    }
    if (line.includes("*/")) {
      comment = false;
    }
    if (!comment && !line.includes("//") && line.includes("@Test")) {
      flag = true;
    } else if (flag && !(line == "\n") && !comment) {
      const methodName = line
        .replace(/public void /g, "")
        .replace(/\(.*/, "")
        .replace(/\r+$/, "")
        .trim();
      if (!madeTest.includes(methodName) && !testNames.includes(methodName)) {
        testNames.push(methodName);
      }
      flag = false;
    }
  }
}
function countTestNum(
  directoryPath: string,
  studentNumber: string,
  session: string,
  madeTest: string[],
  testInfoByDate: TestInfoByDate[]
): void {
  const results: [number, null, number][] = [];
  let isFirst: boolean = true;
  const items: string[] = fs.readdirSync(directoryPath); //ws-history
  let firstDate: Date = new Date();
  let targetDate: Date = new Date();
  let prevDate: Date = new Date();
  let blank: number = 0;
  let finalTestNames: string[] = [];
  //item is YYYY-MM-DD

  for (const item of items) {
    let testNames: string[] = [];
    const langPath = path.join(
      directoryPath,
      item,
      "src",
      "test",
      "java",
      "lang"
    );
    processDirectory(langPath, testNames, madeTest);

    //itemを0基準にしてさらに間を詰める
    targetDate = convertDate(item);
    if (isFirst) {
      firstDate = convertDate(item);
      isFirst = false;
    } else {
      //1時間超えたら
      if (targetDate.getTime() - prevDate.getTime() > 3600000) {
        blank += targetDate.getTime() - prevDate.getTime();
        prevDate = targetDate;
        continue;
      }
    }
    //ms -> hour
    const passTime =
      (targetDate.getTime() - firstDate.getTime() - blank) / (1000 * 60);
    prevDate = targetDate;
    const dateFormat = new Date(item.replace(/_/g, " ").replace(/\./g, ":"));
    testInfoByDate.push({
      date: dateFormat,
      testNames: testNames,
    });
    //itemを経過時間に変換する
    results.push([passTime, null, testNames.length]);
    finalTestNames = [...testNames];
    //for debug
    if (!fs.existsSync("./debug")) {
      fs.mkdirSync("./debug", { recursive: true });
    }
    fs.writeFileSync(
      "./debug/debug_" + session + ".txt",
      finalTestNames.join("\n").toString(),
      "utf-8"
    );
    fs.writeFileSync(
      "./debug/madeTest_" + session + ".txt",
      madeTest.join("\n").toString(),
      "utf-8"
    );
  }

  for (const item of finalTestNames) {
    if (!madeTest.includes(item)) {
      madeTest.push(item); //全部終わってからまとめて更新する
    }
  }
  createGoogleCharts(results, studentNumber, session);
}
function convertDate(str: string): Date {
  const result = new Date(str.replace("_", "T").replace(/\./g, ":"));
  return result;
}
function processDirectory(
  langPath: string,
  testNames: string[],
  madeTest: string[]
): void {
  processSubdirectory(langPath, testNames, madeTest, "");
  processSubdirectory(langPath, testNames, madeTest, "c");
  processSubdirectory(langPath, testNames, madeTest, "c/parse");
}
function processSubdirectory(
  langPath: string,
  testNames: string[],
  madeTest: string[],
  subDir: string
): void {
  const subPath = path.join(langPath, subDir);

  const subItems = fs.readdirSync(subPath);
  for (const item of subItems) {
    const fullPath = path.join(subPath, item);
    if (fs.statSync(fullPath).isFile()) {
      searchTestNames(fullPath, testNames, madeTest);
    }
  }
}
type ChartsData = [number, null | number, number][];
function calculateGuideline(
  results: ChartsData,
  distributedTests: number
): ChartsData {
  const lastResult = results[results.length - 1];
  const lastElapsedTime = lastResult[0];
  const lastTestCases = lastResult[2];
  const averageTimePerTest = lastElapsedTime / lastTestCases;
  const parallelEndTime = distributedTests * averageTimePerTest;
  return results.map(([elapsedTime, guidelineTestCases, testCases]) => {
    if (elapsedTime <= parallelEndTime) {
      guidelineTestCases = distributedTests;
    } else {
      const remainingTime = elapsedTime - parallelEndTime;
      const remainingTests = lastTestCases - distributedTests;
      const slope = remainingTests / (lastElapsedTime - parallelEndTime);
      guidelineTestCases = distributedTests + remainingTime * slope;
    }
    return [elapsedTime, guidelineTestCases, testCases];
  });
}
function createGoogleCharts(
  results: ChartsData,
  studentNumber: string,
  session: string
) {
  const dataReplacePattern = "##%%$$DATA$$%%##";
  const titleRePlacePattern = "##%%$$TITLE$$%%##";
  const sessionReplacePattern = "##%%$$SESSION$$%%##";
  const samplePath = "./chart-template/chart-template.txt";
  const outputPath =
    "./output/" +
    studentNumber +
    "/googleChart" +
    "_" +
    studentNumber +
    "_" +
    session +
    ".html";

  if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  }
  const template = fs.readFileSync(samplePath);

  const distributedTestsPath = "./output/testDistributed.json";
  const distributedTestsData = JSON.parse(
    fs.readFileSync(distributedTestsPath, "utf8")
  );
  const distributedTestNum: number =
    distributedTestsData[Number(session.slice(-1)) - 1].testNames.length;
  const jsonResults = JSON.stringify(
    calculateGuideline(results, distributedTestNum)
  );
  const chartHTML = template
    .toString()
    .replace(dataReplacePattern, jsonResults)
    .replace(titleRePlacePattern, studentNumber)
    .replace(sessionReplacePattern, session);
  fs.writeFileSync(outputPath, chartHTML, "utf-8");
}

function createGoogleChartsLater(): void {
  // ts-node ./createGoogleChartsLater 70110001 1~7
  const args = process.argv.slice(2);
  const studentNumber: number = Number(args[0]);
  const session: number = Number(args[1]);
  const dataReplacePattern = "##%%$$DATAFORRATIO$$%%##";
  const modelReplacePattern = "##%%$$DATAFORMODEL$$%%##";
  const tableReplacePattern = "##%%$$DATAFORTABLE$$%%##";
  for (let sid: number = 1; sid <= session; sid++) {
    const htmlPath =
      "./output/" +
      studentNumber +
      "/googleChart" +
      "_" +
      studentNumber +
      "_" +
      sid +
      ".html";
    const passRatioPath =
      "../code-timechart/output/passRatio/" +
      studentNumber +
      "/cv0" +
      sid +
      "passRatio.txt";
    const tablePath =
      "../code-timechart/output/" +
      studentNumber +
      "/cv0" +
      sid +
      "failedTestLifeTime.txt";
    if (!fs.existsSync(htmlPath)) {
      console.log(`not exists ${htmlPath}`);
      return;
    }
    if (!fs.existsSync(passRatioPath)) {
      console.log(`not exist ${passRatioPath}`);
      return;
    }
    if (!fs.existsSync(tablePath)) {
      console.log(`not exist ${tablePath}`);
      return;
    }
    const htmlData = fs.readFileSync(htmlPath, "utf8");
    const passRatioData = fs.readFileSync(passRatioPath, "utf8");
    const tableData = fs.readFileSync(tablePath, "utf8");
    let max: number = 0;
    const passRatioArray = passRatioData.split("\n").map((line) => {
      const [date, ratio, num] = line.split(",");
      if (max < Number(num)) {
        max = Number(num);
      }
      return `[${date},${ratio}]`;
    });
    const tableArray = tableData.split("\n").map((line) => {
      const [name, time] = line.split(",");
      return `[${name},${time}]`;
    });
    const maxElapsedTime: number = Number(
      passRatioArray[0][passRatioArray.length - 1]
    );
    const distributedTestPath = "./output/testDistributedTest.json";
    const distributedTestData = JSON.parse(
      fs.readFileSync(distributedTestPath, "utf8")
    );
    const distributedTestNum: number =
      distributedTestData[session - 1].testNames.length;
    const guidelineData = createGuidelineData(distributedTestNum, max);
    const adjustedData = adjustDataForElapsedTime(
      guidelineData,
      maxElapsedTime
    );

    const result = htmlData
      .replace(dataReplacePattern, passRatioArray.join(","))
      .replace(modelReplacePattern, adjustedData.join(","))
      .replace(tableReplacePattern, tableArray.join(","));
    fs.writeFileSync(htmlPath, result, "utf-8");
  }
}
function toFraction(numerator: number, denominator: number): number {
  return denominator === 0 ? 0 : numerator / denominator;
}
function createGuidelineData(
  distributedTests: number,
  maxTests: number
): number[][] {
  const guidelineData: number[][] = [];
  for (let i = 0; i <= distributedTests; i++) {
    const fraction = toFraction(i, distributedTests);
    guidelineData.push([fraction]);
  }
  for (
    let denominator = distributedTests + 1;
    denominator <= maxTests;
    denominator++
  ) {
    const numerator = denominator - 1;
    if (numerator >= 0) {
      const fraction = toFraction(numerator, denominator);
      guidelineData.push([fraction]);
    }
    guidelineData.push([toFraction(denominator, denominator)]);
  }
  return guidelineData;
}
function adjustDataForElapsedTime(
  guidelineData: number[][],
  maxElapsedTime: number
): number[][] {
  const totalPoints = guidelineData.length;
  return guidelineData.map((data, index) => {
    const elapsedTime = (index / (totalPoints - 1)) * maxElapsedTime;
    return [elapsedTime, data[0]];
  });
}
function countTestCaseModel(directoryPath: string): void {
  let testDistributed: TestCaseModel[] = [];
  const outputPath = "./output/testDistributed.json";
  if (fs.existsSync(outputPath)) {
    fs.unlinkSync(outputPath);
  }
  for (let i = 1; i <= 7; i++) {
    let hoge: string[] = [];
    const testNames: string[] = [];
    let str = `test0${i}`;
    const langPath = path.join(directoryPath, str, "java", "lang");
    processDirectory(langPath, testNames, hoge);
    const data = {
      sid: i,
      num: testNames.length,
      testNames: testNames,
    };
    testDistributed.push(data);
  }
  if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  }
  fs.writeFileSync(outputPath, JSON.stringify(testDistributed, null, 2), {
    flag: "a",
    encoding: "utf-8",
  });
}

function createEachPath(studentNumber: string, sid: number): string {
  const basePath = path.join("d:/unzips", studentNumber);
  const dirs = fs.readdirSync(basePath, { withFileTypes: true });

  for (const dir of dirs) {
    if (dir.isDirectory() && dir.name.includes("CV0" + sid)) {
      const sessionPath = path.join(basePath, dir.name);
      const createdPath = path.join(
        sessionPath,
        "kokokonolabs-log-fv01",
        "ws-history"
      );
      return createdPath;
    }
  }
  throw new Error(`Error: Directory containing 0${sid} not found.`);
}
function main(): void {
  const jsonPath = "./output/testDistributed.json";
  const testCaseModelPath = "./testCaseModel";
  let madeTest: string[] = [];
  countTestCaseModel(testCaseModelPath);
  const studentNumber: string = process.argv.slice(2)[0];
  const sid: number = Number(process.argv.slice(2)[1]);
  const testInfoBySid: TestInfoBySid[] = [];
  for (let i = 1; i <= sid; i++) {
    const filePath = createEachPath(studentNumber, i);
    const testInfoByDate: TestInfoByDate[] = [];
    countTestNum(filePath, studentNumber, `cv0${i}`, madeTest, testInfoByDate);
    testInfoBySid.push({ sid: `cv0${i}`, info: testInfoByDate });
  }
  const outputPath = `../code-timechart/output/testInfoByDate/${studentNumber}testInfoByDate.json`;
  if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  }
  fs.writeFileSync(outputPath, JSON.stringify(testInfoBySid, null, 2), "utf-8");
}
main();
