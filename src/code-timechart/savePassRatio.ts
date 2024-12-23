import * as fs from "fs-extra";
import { writeAvgPassRatioDifferent } from "./rankCalculator";
interface JsonData {
  sid: number;
  num: number;
  testNames: string[];
}
function savePassRatioPath(): void {
  const args = process.argv.slice(2);
  const studentNumber: number = Number(args[0]);
  const session: number = Number(args[1]);
  for (let sid = 1; sid <= session; sid++) {
    const testDistributedPath = "./output/testDistributed.json";
    const passRatioPath =
      "./output/passRatio/" + studentNumber + "/cv0" + sid + "passRatio.txt";
    if (!fs.existsSync(passRatioPath)) {
      console.log(`not exist ${passRatioPath}`);
      return;
    }
    const jsonData = fs.readFileSync(testDistributedPath, "utf8");
    const jsonResult = JSON.parse(jsonData);
    const target = jsonResult.find((item: JsonData) => item.sid == sid);
    const distributedTestNum: number = target.num;
    const passRatioData = fs.readFileSync(passRatioPath, "utf8");
    let maxNum: number = 0;
    const passRatioArray = passRatioData
      .split("\n")
      .filter((line) => line.trim() != "")
      .map((line) => {
        const [date, ratio, num] = line.split(",");
        if (maxNum < Number(num)) {
          maxNum = Number(num);
        }
        return [Number(date), Number(ratio)]; //Number(date) / (1000 * 60)
      });
    const guidelineDataForCalcRank = createGuidelineDataForCalcRank(
      distributedTestNum,
      maxNum,
      passRatioArray
    );
    const avgPassRatioDifferentNum = calcAvgPassRatioDifferent(
      guidelineDataForCalcRank
    );
    writeAvgPassRatioDifferent(
      studentNumber.toString(),
      "cv0" + sid.toString(),
      avgPassRatioDifferentNum
    );
  }
}
function createGuidelineDataForCalcRank(
  distributedTests: number,
  maxTests: number,
  passRatioArray: number[][]
): number[][] {
  const guidelineData: number[][] = [];
  const guidelineFractions: number[][] = [];

  for (let i = 0; i <= distributedTests; i++) {
    guidelineFractions.push([toFraction(i, distributedTests)]);
  }
  for (
    let denominator = distributedTests + 1;
    denominator <= maxTests;
    denominator++
  ) {
    const numerator = denominator - 1;
    if (numerator >= 0) {
      guidelineFractions.push([toFraction(numerator, denominator)]);
    }
    guidelineFractions.push([toFraction(denominator, denominator)]);
  }
  // 補間のための時間調整
  const totalPoints = guidelineFractions.length;
  const maxElapsedTime = passRatioArray[passRatioArray.length - 1][0];

  const interpolatedData = guidelineFractions.map((data, index) => {
    const elapsedTime = (index / (totalPoints - 1)) * maxElapsedTime;
    return [elapsedTime, data[0]];
  });
  // 実際の時刻に基づいて補間
  let currentIndex = 0;
  for (const timestamp of passRatioArray) {
    while (
      currentIndex < interpolatedData.length - 1 &&
      interpolatedData[currentIndex][0] < timestamp[0]
    ) {
      currentIndex++;
    }

    if (currentIndex === 0 || currentIndex >= interpolatedData.length) {
      guidelineData.push([
        timestamp[0],
        interpolatedData[currentIndex][1],
        timestamp[1],
      ]);
    } else {
      // 線形補間
      const [prevTime, prevValue] = interpolatedData[currentIndex - 1];
      const [nextTime, nextValue] = interpolatedData[currentIndex];
      const interpolatedValue =
        prevValue +
        ((nextValue - prevValue) / (nextTime - prevTime)) *
          (timestamp[0] - prevTime);
      guidelineData.push([timestamp[0], interpolatedValue, timestamp[1]]);
    }
  }

  return guidelineData;
}
function toFraction(numerator: number, denominator: number): number {
  if (denominator == 0) {
    throw new Error("Denominator cannot be zero.");
  }
  const result = numerator / denominator;
  return Math.round(result * 100 * 100) / 100;
}
function calcAvgPassRatioDifferent(array: number[][]): number {
  const passRatioDifferentNum = array
    .map((element) => Math.abs(element[1] - element[2]))
    .reduce((num, value) => num + value, 0);
  const avgPassRatioDifferentNum = passRatioDifferentNum / array.length;
  return avgPassRatioDifferentNum;
}
savePassRatioPath();
