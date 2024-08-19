import * as fs from "fs";
import * as path from "path";
function searchTestNames(path: string, testNames: string[]): void {
  let flag: boolean = false;
  let comment: boolean = false;
  const content = fs.readFileSync(path, "utf-8");
  const lines = content.split("\n");
  //\*だけで1行という前提
  for (const line of lines) {
    if (line.includes("/*")) {
      comment = true;
    }
    if (line.includes("*/")) {
      comment = false;
    }
    if (!comment && !line.includes("//") && line.includes("@Test")) {
      flag = true;
    } else if (flag && !(line == "\n") && !comment) {
      let methodName = line.replace(/public void /g, "");
      methodName = methodName.replace(/\(.*/, "");
      methodName = methodName.replace(/\r+$/, "");
      testNames.push(methodName.trim());
      flag = false;
    }
  }
}
function countTestNum(
  directoryPath: string,
  studentNumber: string,
  session: string
): void {
  const results: [number, null, number][] = [];
  let isFirst: boolean = true;
  const items = fs.readdirSync(path.join(directoryPath, studentNumber)); //ws-history
  let firstDate: Date = new Date();
  let targetDate: Date = new Date();
  let prevDate: Date = new Date();
  let blank: number = 0;
  //item is YYYY-MM-DD
  for (const item of items) {
    const testNames: string[] = [];
    const langPath = path.join(
      directoryPath,
      studentNumber,
      item,
      "src",
      "test",
      "java",
      "lang"
    );
    processDirectory(langPath, testNames);

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
  }

  createGoogleCharts(results, studentNumber, session);
}
function convertDate(str: string): Date {
  const result = new Date(str.replace("_", "T").replace(/\./g, ":"));
  return result;
}
function processDirectory(langPath: string, testNames: string[]): void {
  processSubdirectory(langPath, testNames, "");
  processSubdirectory(langPath, testNames, "c");
  processSubdirectory(langPath, testNames, "c/parse");
}
function processSubdirectory(
  langPath: string,
  testNames: string[],
  subDir: string
): void {
  const subPath = path.join(langPath, subDir);

  const subItems = fs.readdirSync(subPath);
  for (const item of subItems) {
    const fullPath = path.join(subPath, item);
    if (fs.statSync(fullPath).isFile()) {
      searchTestNames(fullPath, testNames);
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
  const outputPath = "./output/googleChart.html";
  const template = fs.readFileSync(samplePath);
  const min = 175;
  const max = 185;

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
  type TestCaseModel = {
    sid: number;
    num: number;
    testNames: string[];
  };
  let testDistributed: TestCaseModel[] = [];
  const outputPath = "./output/testDistributed.json";
  if (fs.existsSync(outputPath)) {
    fs.unlinkSync(outputPath);
  }
  for (let i = 1; i <= 7; i++) {
    const testNames: string[] = [];
    let str = "test0";
    str += i;
    const langPath = path.join(directoryPath, str, "java", "lang");
    processDirectory(langPath, testNames);
    const data = {
      sid: i,
      num: testNames.length,
      testNames: testNames,
    };
    testDistributed.push(data);
  }
  fs.writeFileSync(outputPath, JSON.stringify(testDistributed, null, 2), {
    flag: "a",
    encoding: "utf-8",
  });
}

const filePath = "./student";
const testCaseModelPath = "./testCaseModel";
//countTestNum(filePath, "70110023", "cv05");
countTestCaseModel(testCaseModelPath);
