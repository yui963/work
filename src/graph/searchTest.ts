import * as fs from "fs";
import * as path from "path";
import {
  DateAndEstimate,
  analyzeStateInfoForWS,
} from "./analyzeStateInfoForWS";
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
  testInfoByDate: TestInfoByDate[],
  dateAndEstimate: DateAndEstimate[]
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

    // //itemを0基準にしてさらに間を詰める
    // targetDate = convertDate(item);
    // if (isFirst) {
    //   firstDate = convertDate(item);
    //   isFirst = false;
    // } else {
    //   //10分越えたら
    //   if (targetDate.getTime() - prevDate.getTime() > 600000) {
    //     blank += targetDate.getTime() - prevDate.getTime();
    //     prevDate = targetDate;
    //     continue;
    //   }
    // }
    // //ms -> hour
    // const passTime =
    //   (targetDate.getTime() - firstDate.getTime() - blank) / (1000 * 60);
    // prevDate = targetDate;
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
      results.push([passTime / 60000, null, testNames.length]);
      finalTestNames = [...testNames];
    } else {
      console.error("findResult is false");
    }

    // //for debug
    // if (!fs.existsSync("./debug")) {
    //   fs.mkdirSync("./debug", { recursive: true });
    // }
    // fs.writeFileSync(
    //   "./debug/debug_" + session + ".txt",
    //   finalTestNames.join("\n").toString(),
    //   "utf-8"
    // );
    // fs.writeFileSync(
    //   "./debug/madeTest_" + session + ".txt",
    //   madeTest.join("\n").toString(),
    //   "utf-8"
    // );
  }

  for (const item of finalTestNames) {
    if (!madeTest.includes(item)) {
      madeTest.push(item); //全部終わってからまとめて更新する
    }
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
    ".txt";

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
function countFirstTestCase(): void {
  const projectPath = "./miniCV00forStudent2023/src/test/java/lang";
  const outputPath = "./output/firstTestCase.txt";
  if (!fs.existsSync(projectPath)) {
    console.error("not exist First Project Folder");
  }
  let hoge: string[] = [];
  const testNames: string[] = [];
  processDirectory(projectPath, testNames, hoge);
  fs.writeFileSync(outputPath, testNames.toString(), "utf8");
  return;
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
  const testCaseModelPath = "./testCaseModel";
  const firstTestCasePath = "./output/firstTestCase.txt";
  let madeTest: string[] = [];
  if (!fs.existsSync(firstTestCasePath)) {
    countFirstTestCase();
  }
  const data = fs.readFileSync(firstTestCasePath, "utf8");
  madeTest = data.split(",");
  countTestCaseModel(testCaseModelPath);
  const studentNumber: string = process.argv.slice(2)[0];
  const sid: number = Number(process.argv.slice(2)[1]);
  const testInfoBySid: TestInfoBySid[] = [];
  const dateAndEstimate: DateAndEstimate[] = analyzeStateInfoForWS();
  for (let i = 1; i <= sid; i++) {
    const filePath = createEachPath(studentNumber, i);
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
  const outputPath = `../code-timechart/output/testInfoByDate/${studentNumber}testInfoByDate.json`;
  if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  }
  fs.writeFileSync(outputPath, JSON.stringify(testInfoBySid, null, 2), "utf-8");
}
main();
