import { kMaxLength } from "buffer";
import * as fs from "fs";
import * as path from "path";
type TestCaseModel = {
  sid: number;
  num: number;
  testNames: string[];
};
type TestInfoByDate = {
  date: string;
  testNames: string[];
};
type TestInfoBySid = {
  sid: string;
  info: TestInfoByDate[];
};
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
  testDistributed: string[],
  testInfoByDate: TestInfoByDate[]
): void {
  const results: [number, null, number][] = [];
  let isFirst: boolean = true;
  const items = fs.readdirSync(directoryPath); //ws-history
  let firstDate: Date = new Date();
  let targetDate: Date = new Date();
  let prevDate: Date = new Date();
  let blank: number = 0;
  let finalTestNames: string[] = [];
  //item is YYYY-MM-DD

  for (const item of items) {
    let testNames: string[] = [...testDistributed];
    const langPath = path.join(
      directoryPath,
      item,
      "src",
      "test",
      "java",
      "lang"
    );
    processDirectory(langPath, testNames, madeTest);
    testInfoByDate.push({ date: item, testNames: testNames });
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
function createGoogleCharts(
  results: [number, null | number, number][],
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
  const min = 0;
  const max = results[results.length - 1][2];
  results[0][1] = min;
  results[results.length - 1][1] = max;

  const jsonResults = JSON.stringify(results);
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
    let str = "test0${i}";
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
  throw new Error(`Error: Directory containing "0${sid}" not found.`);
}
function main(): void {
  const jsonPath = "./output/testDistributed.json";
  const testCaseModelPath = "./testCaseModel";
  let madeTest: string[] = [];
  countTestCaseModel(testCaseModelPath);
  const testDistributed = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
  const studentNumber: string = process.argv.slice(2)[0];
  const sid: number = Number(process.argv.slice(2)[1]);
  const testInfoBySid: TestInfoBySid[] = [];
  for (let i = 1; i <= sid; i++) {
    const filePath = createEachPath(studentNumber, i);
    madeTest.push(...testDistributed[i - 1].testNames);
    const testInfoByDate: TestInfoByDate[] = [];
    countTestNum(
      filePath,
      studentNumber,
      "cv0${i}",
      madeTest,
      testDistributed[i - 1].testNames,
      testInfoByDate
    );
    testInfoBySid.push({ sid: "CV0${i}", info: testInfoByDate });
  }
  const outputPath =
    "./output/${studentNumber}/${studentNumber}testInfoByDate.json";
  if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  }
  fs.writeFileSync(outputPath, JSON.stringify(testInfoBySid, null, 2), "utf-8");
}
main();
