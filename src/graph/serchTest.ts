import * as fs from "fs";
import * as path from "path";
import { createObjectCsvWriter } from "csv-writer";
function searchTestNames(path: string, testNames: string[]): void {
  let flag: boolean = false;
  const content = fs.readFileSync(path, "utf-8");

  const lines = content.split("\n");
  for (const line of lines) {
    if (line.includes("@Test")) {
      flag = true;
    } else if (flag && !(line == "\n")) {
      let methodName = line.replace(/public void /g, "");
      methodName = methodName.replace(/\(.*/, "");
      testNames.push(methodName);
      flag = false;
    }
  }
}
function countTestNum(directoryPath: string): void {
  const items = fs.readdirSync(directoryPath); //ws-history
  //item is YYYY-MM-DD
  for (const item of items) {
    const testNames: string[] = [];
    const langPath = path.join(
      directoryPath,
      item,
      "src",
      "test",
      "java",
      "lang"
    );
    processDirectory(langPath, testNames);
    writeCsv(item, testNames.length);
  }
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
function writeCsv(date: string, num: number) {
  const csvFilePath = "./output/methodNum.csv";
  const data = [{ date: date, num: num }];
  const csvWriter = createObjectCsvWriter({
    path: csvFilePath,
    header: [
      { id: "date", title: "Date" },
      { id: "num", title: "Num" },
    ],
    append: true,
  });

  csvWriter
    .writeRecords(data)
    .then(() => console.log("CSVファイルが正常に出力されました"))
    .catch((err: any) =>
      console.error("CSVファイルの出力中にエラーが発生しました", err)
    );
}

const filePath = "./ws-history";
countTestNum(filePath);
