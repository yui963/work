import * as fs from "fs";
import * as path from "path";
import { createObjectCsvWriter } from "csv-writer";
import { start } from "repl";
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
      testNames.push(methodName);
      flag = false;
    }
  }
}
function countTestNum(
  directoryPath: string,
  studentNumber: string,
  session: string
): void {
  const results: [number, number][] = [];
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
    results.push([passTime, testNames.length]);
    // writeCsv(item, testNames.length);
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
// function writeCsv(date: string, num: number) {
//   const csvFilePath = "./output/methodNum.csv";
//   const data = [{ date: date, num: num }];
//   const csvWriter = createObjectCsvWriter({
//     path: csvFilePath,
//     header: [
//       { id: "date", title: "Date" },
//       { id: "num", title: "Num" },
//     ],
//     append: true,
//   });

//   csvWriter
//     .writeRecords(data)
//     .then()
//     .catch((err: any) =>
//       console.error("CSVファイルの出力中にエラーが発生しました", err)
//     );
// }
function createGoogleCharts(
  results: [number, number][],
  studentNumber: string,
  session: string
) {
  const dataReplacePattern = "##%%$$DATA$$%%##";
  const titleRePlacePattern = "##%%$$TITLE$$%%##";
  const sessionReplacePattern = "##%%$$SESSION$$%%##";
  const samplePath = "./chart-template/chart-template.txt";
  const outputPath = "./output/googleChart.html";
  const template = fs.readFileSync(samplePath);
  const jsonResults = JSON.stringify(results);
  const chartHTML = template
    .toString()
    .replace(dataReplacePattern, jsonResults)
    .replace(titleRePlacePattern, '"' + studentNumber + '"')
    .replace(sessionReplacePattern, '"' + session + '"');
  fs.writeFileSync(outputPath, chartHTML, "utf-8");
}

const filePath = "./student";
// countTestNum(path.join(filePath, "70110023"));
countTestNum(filePath, "70110094", "cv06");
