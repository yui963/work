import * as fs from "fs";
import * as path from "path";
import {
  DateAndEstimate,
  analyzeStateInfoForWS,
} from "./analyzeStateInfoForWS";
import { writeAvgDifferenceTestSum } from "./rankCalculator";
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
  testInfoByDate: TestInfoByDate[],
  dateAndEstimate: DateAndEstimate[]
): void {
  const results: [number, number, number][] = [];
  const items: string[] = fs.readdirSync(directoryPath); //ws-history
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
    const dateFormat: Date = new Date(
      item.replace(/_/g, " ").replace(/\./g, ":")
    );
    testInfoByDate.push({
      date: dateFormat,
      testNames: testNames,
    });
    const findResult = dateAndEstimate.find(
      (item) => new Date(item.date).getTime() == dateFormat.getTime()
    );
    if (findResult) {
      const passTime = findResult.estimate;
      results.push([passTime / 60000, 0, testNames.length]);
      finalTestNames = [...testNames];
    } else {
      console.error("findResult is false");
    }
  }

  for (const item of finalTestNames) {
    if (!madeTest.includes(item)) {
      madeTest.push(item); //全部終わってからまとめて更新する
    }
  }
  if (results.length == 0) {
    console.log(studentNumber + ":" + session + " is fail");
    return;
  }
  createGoogleCharts(results, studentNumber, session);
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
type ChartsData = [number, number, number][];
function calculateGuideline(results: ChartsData): ChartsData {
  const lastResult = results[results.length - 1];
  const lastElapsedTime = lastResult[0];
  const lastTestCases = lastResult[2];
  return results.map(([elapsedTime, guidelineTestCases, testCases]) => {
    const slope = lastTestCases / lastElapsedTime;
    guidelineTestCases = elapsedTime * slope;
    return [elapsedTime, guidelineTestCases, testCases];
  });
}
function createGoogleCharts(
  results: ChartsData,
  studentNumber: string,
  session: string
) {
  const dataReplacePattern = "##%%$$DATA$$%%##";
  const titleReplacePattern = "##%%$$TITLE$$%%##";
  const sessionReplacePattern = "##%%$$SESSION$$%%##";
  const samplePath = "./chart-template/graph-template.txt";
  const outputPath =
    "./output/graph/" +
    studentNumber +
    "/graph" +
    "_" +
    studentNumber +
    "_" +
    session +
    ".txt";

  if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  }
  const template = fs.readFileSync(samplePath);
  const chartData = calculateGuideline(results);
  const jsonResults = JSON.stringify(chartData);

  const differenceTestSum = chartData
    .map((element) => Math.abs(element[1] - element[2]))
    .reduce((sum, value) => sum + value, 0);
  const avgDifferenceSum = differenceTestSum / chartData.length;
  writeAvgDifferenceTestSum(studentNumber, session, avgDifferenceSum);
  const chartHTML = template
    .toString()
    .replace(dataReplacePattern, jsonResults)
    .replace(titleReplacePattern, studentNumber)
    .replace(sessionReplacePattern, session);
  fs.writeFileSync(outputPath, chartHTML, "utf-8");
}
function countFirstTestCase(): string {
  const projectPath = "./miniCV00forStudent2024/src/test/java/lang";
  if (!fs.existsSync(projectPath)) {
    console.error("not exist First Project Folder");
  }
  let hoge: string[] = []; //初期の空配列
  const testNames: string[] = [];
  processDirectory(projectPath, testNames, hoge);
  return testNames.toString();
}
function createEachPath(studentNumber: string, sid: number): string {
  const basePath = path.join("G:/unzips2024", studentNumber);
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
  console.log(`Error: Directory containing 0${sid} not found.`);
  return "NotFound";
}
function main(): void {
  let madeTest: string[] = [];
  const data = countFirstTestCase();
  madeTest = data.split(",");
  const studentNumber: string = process.argv.slice(2)[0];
  const sid: number = Number(process.argv.slice(2)[1]);
  const testInfoBySid: TestInfoBySid[] = [];
  const dateAndEstimate: DateAndEstimate[] = analyzeStateInfoForWS();
  for (let i = 1; i <= sid; i++) {
    const filePath = createEachPath(studentNumber, i);
    if (filePath == "NotFound") {
      continue;
    }
    const testInfoByDate: TestInfoByDate[] = [];
    countTestNum(
      filePath,
      studentNumber,
      `cv0${i}`,
      madeTest,
      testInfoByDate,
      dateAndEstimate
    );
    testInfoBySid.push({ sid: `cv0${i}`, info: testInfoByDate });
  }
  const outputPath = `./output/testInfoByDate/${studentNumber}testInfoByDate.json`;
  if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  }
  fs.writeFileSync(outputPath, JSON.stringify(testInfoBySid, null, 2), "utf-8");
}
main();
