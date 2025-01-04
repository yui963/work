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
//補完処理
function createGuidelineDataForCalcRank(
  distributedTests: number,
  maxTests: number,
  passRatioArray: number[][]
): number[][] {
  const guidelineData: number[][] = [];
  const guidelineFractions: number[][] = [];
  //前半の分数挿入(後に削除)
  for (let i = 0; i <= distributedTests; i++) {
    guidelineFractions.push([toFraction(i, distributedTests)]);
  }
  //後半の分数挿入
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
  const totalPoints = guidelineFractions.length;
  const maxElapsedTime = passRatioArray[passRatioArray.length - 1][0];

  const interpolatedData = guidelineFractions.map((data, index) => {
    const elapsedTime = (index / (totalPoints - 1)) * maxElapsedTime;
    return [elapsedTime, data[0]];
  });
  let currentIndex = 0;
  for (const element of interpolatedData) {
    const date = element[0];
    const rate = element[1];
    //補完時刻の次のデータポイントを取得
    while (
      currentIndex < passRatioArray.length - 1 &&
      passRatioArray[currentIndex][0] < date
    ) {
      currentIndex++;
    }
    if (currentIndex != 0) {
      guidelineData.push([date, rate, passRatioArray[currentIndex - 1][1]]);
    } else {
      guidelineData.push([date, rate, 0]);
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
