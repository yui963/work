import * as fs from "fs-extra";
import {
  getPassRatioRank,
  getTestFirstProcessRank,
  getTestLifeTimeRank,
  getTestNumRank,
} from "./rankCalculator";
interface JsonData {
  sid: number;
  num: number;
  testNames: string[];
}
function editGraphHTML(): void {
  const args = process.argv.slice(2);
  const studentNumber: number = Number(args[0]);
  const session: number = Number(args[1]);
  const dataReplacePattern = "##%%$$DATAFORRATIO$$%%##";
  const modelReplacePattern = "##%%$$DATAFORMODEL$$%%##";
  const tableReplacePattern = "##%%$$DATAFORTABLE$$%%##";
  const timelineReplacePattern = "##%%$$DATAFORTIMELINE$$%%##";
  const endTimeReplacePattern = "##%%$$ENDTIME$$%%##";
  const testFirstProcessRankPattern = "##%%$$TESTFIRSTPROCESSRANK$$%%##";
  const testLifeTimeRankPattern = "##%%$$TESTLIFETIMERANK$$%%##";
  const testNumRankPattern = "##%%$$TESTNUMRANK$$%%##";
  const passRatioRankPattern = "##%%$$PASSRATIORANK$$%%##";
  for (let sid = 1; sid <= session; sid++) {
    const txtPath =
      "./output/graph/" +
      studentNumber +
      "/graph" +
      "_" +
      studentNumber +
      "_cv0" +
      sid +
      ".txt";
    const htmlPath =
      "./output/graph/" +
      studentNumber +
      "/graph" +
      "_" +
      studentNumber +
      "_cv0" +
      sid +
      ".html";
    const passRatioPath =
      "./output/passRatio/" + studentNumber + "/cv0" + sid + "passRatio.txt";
    const tablePath =
      "./output/failedTestLifeTime/" +
      studentNumber +
      "/cv0" +
      sid +
      "failedTestLifeTime.json";
    const timelinePath =
      "./output/failedTestLifeTime/" +
      studentNumber +
      "/cv0" +
      sid +
      "timeline.txt";
    if (!fs.existsSync(passRatioPath)) {
      console.log(`not exist ${passRatioPath}`);
      return;
    }
    if (!fs.existsSync(tablePath)) {
      console.log(`not exist ${tablePath}`);
      return;
    }
    if (!fs.existsSync(timelinePath)) {
      console.log(`not exists ${timelinePath}`);
      return;
    }
    if (!fs.existsSync(txtPath)) {
      console.log(`not exists ${txtPath}`);
      return;
    }
    const htmlData = fs.readFileSync(txtPath, "utf8");
    const passRatioData = fs.readFileSync(passRatioPath, "utf8");
    const tableData = fs.readFileSync(tablePath, "utf8");
    const timelineData = fs.readFileSync(timelinePath, "utf8");
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
    const EndTime: number = Number(
      passRatioArray[passRatioArray.length - 1][0]
    );
    const passRatioArrayToMins = passRatioArray.map((row) => {
      return [row[0] / (1000 * 60), row[1]];
    });
    const maxElapsedTime: number = Number(
      passRatioArrayToMins[passRatioArray.length - 1][0]
    );
    const tableArray: [string, number][] = JSON.parse(tableData).map(
      ([name, timeStr]: [string, string]) => {
        const time = parseFloat(timeStr);
        return [name, time];
      }
    );
    const guidelineData = createGuidelineData(maxNum);
    const adjustedData = adjustDataForElapsedTime(
      guidelineData,
      maxElapsedTime
    );
    const data = JSON.stringify(passRatioArrayToMins);
    const testFirstProcessRank = getTestFirstProcessRank(
      "cv0" + sid.toString(),
      studentNumber.toString()
    );
    const testLifeTimeRank = getTestLifeTimeRank(
      "cv0" + sid.toString(),
      studentNumber.toString()
    );
    const testNumRank = getTestNumRank(
      "cv0" + sid.toString(),
      studentNumber.toString()
    );
    const passRatioRank = getPassRatioRank(
      "cv0" + sid.toString(),
      studentNumber.toString()
    );
    const result = htmlData
      .replace(dataReplacePattern, data)
      .replace(endTimeReplacePattern, EndTime.toString())
      .replace(modelReplacePattern, JSON.stringify(adjustedData))
      .replace(tableReplacePattern, JSON.stringify(tableArray))
      .replace(timelineReplacePattern, timelineData)
      .replace(
        testFirstProcessRankPattern,
        testFirstProcessRank[1] + "人中" + testFirstProcessRank[0] + "位"
      )
      .replace(
        testLifeTimeRankPattern,
        testLifeTimeRank[1] + "人中" + testFirstProcessRank[0] + "位"
      )
      .replace(
        testNumRankPattern,
        testNumRank[1] + "人中" + testNumRank[0] + "位"
      )
      .replace(
        passRatioRankPattern,
        passRatioRank[1] + "人中" + passRatioRank[0] + "位"
      );
    fs.writeFileSync(htmlPath, result, "utf-8");
  }
}

function createGuidelineData(maxTests: number): number[][] {
  const guidelineData: number[][] = [];

  for (let denominator = 1; denominator <= maxTests; denominator++) {
    const numerator = denominator - 1;
    if (numerator >= 0) {
      guidelineData.push([toFraction(numerator, denominator)]);
    }
    guidelineData.push([toFraction(denominator, denominator)]);
  }
  return guidelineData;
}
function adjustDataForElapsedTime(
  guidelineData: number[][],
  maxElapsedTime: number
): number[][] {
  const totalPoints = guidelineData.length;
  return guidelineData.map((data, index) => {
    const elapsedTime = (index / (totalPoints - 1)) * maxElapsedTime;
    return [elapsedTime, data[0]];
  });
}

function toFraction(numerator: number, denominator: number): number {
  if (denominator == 0) {
    throw new Error("Denominator cannot be zero.");
  }
  const result = numerator / denominator;
  return Math.round(result * 100 * 100) / 100;
}
editGraphHTML();
