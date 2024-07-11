import * as fs from "fs";
const filePath = "./log-data/data.c";
function getTestNames(path: string): string[] {
  const content = fs.readFieSync(path, "utf-8");
  const testNames: string[] = [];
  return testNames;
}
