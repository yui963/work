import * as fs from "fs";
import * as path from "path";

function searchTestNames(path: string, testNames: string[]): void {
  let flag: boolean = false;
  const content = fs.readFileSync(path, "utf-8");
  const lines = content.split("\n");
  for (const line of lines) {
    if (line == "@test") {
      flag = true;
    }
    if (flag) {
      testNames.push(line);
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
    console.log(item + ":" + testNames + ":" + testNames.length);
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
    searchTestNames(fullPath, testNames);
  }
}

const filePath = "./log-data/~/~/~/~";
countTestNum(filePath);
