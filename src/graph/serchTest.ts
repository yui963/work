import * as fs from "fs";
import * as path from "path";
import { createObjectCsvWriter } from "csv-writer";
import { start } from "repl";
function searchTestNames(path: string, testNames: string[]): void {
  let flag: boolean = false;
  let comment: boolean = false;
  const content = fs.readFileSync(path, "utf-8");

  const lines = content.split("\n");
  for (const line of lines) {
    if (line.startsWith("/*")) {
      comment = true;
    }
    if (line.includes("*/")) {
      comment = false;
    }
    if (!comment && line.startsWith("@Test")) {
      flag = true;
    } else if (flag && !(line == "\n") && !comment) {
      let methodName = line.replace(/public void /g, "");
      methodName = methodName.replace(/\(.*/, "");
      testNames.push(methodName);
      flag = false;
    }
  }
}
function countTestNum(directoryPath: string): void {
  const results: [number, number][] = [];
  let isFirst: boolean = true;
  const items = fs.readdirSync(directoryPath); //ws-history
  let firstDate: Date = new Date();
  let targetDate: Date = new Date();
  let prevDate: Date = new Date();
  //item is YYYY-MM-DD
  for (const item of items) {
    const testNames: string[] = [];
    let interval: number = 0;
    const langPath = path.join(
      directoryPath,
      item,
      "src",
      "test",
      "java",
      "lang"
    );
    processDirectory(langPath, testNames);
    if (isFirst) {
      firstDate = convertDate(item);
      targetDate = convertDate(item);
      isFirst = false;
    } else {
      //1時間超えたら
      if (targetDate.getTime() - prevDate.getTime() > 3600000) {
        prevDate = targetDate;
        break;
      }
      targetDate = convertDate(item);
    }
    interval += targetDate.getTime() - firstDate.getTime();
    prevDate = targetDate;
    //itemを経過時間に変換する
    results.push([interval, testNames.length]);
    // writeCsv(item, testNames.length);
  }

  createGoogleCharts(results);
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
function createGoogleCharts(results: [number, number][]) {
  const dataReplacePattern = "##%%$$DATA$$%%##";
  const samplePath = "./chart-template/chart-template.txt";
  const outputPath = "./output/googleChart.html";
  const template = fs.readFileSync(samplePath);
  const jsonResults = JSON.stringify(results);
  let chartHTML = template.toString().replace(dataReplacePattern, jsonResults);
  fs.writeFileSync(outputPath, chartHTML, "utf-8");
}

const filePath = "./student";
// countTestNum(path.join(filePath, "70110023"));
countTestNum(path.join(filePath, "70110094"));
