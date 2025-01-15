import * as fs from "fs-extra";
import { SessionResult, StudentResult } from "./rankCalculator";
function main(): void {
  const jsonPath = "./output/studentResult.json";
  const studentResults = fs.readFileSync(jsonPath);
  const parse = JSON.parse(studentResults.toString());
  console.log(parse);
  const sid: string = process.argv[2];

  const sessionResult: SessionResult = parse.find(
    (item: SessionResult) => item.sid == sid
  );
  console.log(sessionResult.sessionResults);
  getBestRank(sessionResult.sessionResults);
  return;
}
function getBestRank(studentResults: StudentResult[]): void {
  const topTestFirstProcessRateId =
    findTopTestFirstProcessRateId(studentResults);
  const topAvgTestLifeTimeId = findTopAvgTestLifeTimeId(studentResults);
  const topAvgDifferenceTestSumId =
    findTopAvgDifferenceTestSumId(studentResults);
  const topAvgPassRatioDifferentId =
    findTopAvgPassRatioDifferentId(studentResults);

  console.log("Top Test First Process Rate ID:", topTestFirstProcessRateId);
  console.log("Top Avg Test Life Time ID:", topAvgTestLifeTimeId);
  console.log("Top Avg Difference Test Sum ID:", topAvgDifferenceTestSumId);
  console.log("Top Avg Pass Ratio Different ID:", topAvgPassRatioDifferentId);
  return;
}
function findTopTestFirstProcessRateId(
  studentResults: StudentResult[]
): string {
  return studentResults.reduce((topItem, currentItem) => {
    const currentRate = currentItem.testFirstProcessRate;
    const topRate = topItem.testFirstProcessRate;
    if (currentRate === null) return topItem;
    if (topRate === null || currentRate > topRate) {
      return currentItem;
    }
    return topItem;
  }).id;
}

function findTopAvgTestLifeTimeId(studentResults: StudentResult[]): string {
  return studentResults.reduce((topItem, currentItem) => {
    const currentRate = currentItem.avgTestLifeTime;
    const topRate = topItem.avgTestLifeTime;
    if (currentRate === null) return topItem;
    if (topRate === null || currentRate < topRate) {
      return currentItem;
    }
    return topItem;
  }).id;
}

function findTopAvgDifferenceTestSumId(
  studentResults: StudentResult[]
): string {
  return studentResults.reduce((topItem, currentItem) => {
    const currentRate = currentItem.avgDifferenceTestSum;
    const topRate = topItem.avgDifferenceTestSum;
    if (currentRate === null) return topItem;
    if (topRate === null || currentRate < topRate) {
      return currentItem;
    }
    return topItem;
  }).id;
}

function findTopAvgPassRatioDifferentId(
  studentResults: StudentResult[]
): string {
  return studentResults.reduce((topItem, currentItem) => {
    const currentRate = currentItem.avgPassRatioDifferent;
    const topRate = topItem.avgPassRatioDifferent;
    if (currentRate === null) return topItem;
    if (topRate === null || currentRate < topRate) {
      return currentItem;
    }
    return topItem;
  }).id;
}
main();
