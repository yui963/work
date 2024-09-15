import * as fs from "fs";
interface JsonData {
  sid: number;
  num: number;
  testNames: string[];
}
function createGoogleChartLater(): void {
  // ts-node ./createGoogleChartsLater 70110001 1~7
  const args = process.argv.slice(2);
  const studentNumber: number = Number(args[0]);
  const session: number = Number(args[1]);
  const dataReplacePattern = "##%%$$DATAFORRATIO$$%%##";
  const modelReplacePattern = "##%%$$DATAFORMODEL$$%%##";
  const tableReplacePattern = "##%%$$DATAFORTABLE$$%%##";
  const timelineReplacePattern = "##%%$$DATAFORTIMELINE$$%%##";
  for (let sid = 1; sid <= session; sid++) {
    const txtPath =
      "./output/" +
      studentNumber +
      "/googleChart" +
      "_" +
      studentNumber +
      "_cv0" +
      sid +
      ".txt";
    const htmlPath =
      "./output/" +
      studentNumber +
      "/googleChart" +
      "_" +
      studentNumber +
      "_cv0" +
      sid +
      ".html";
    const passRatioPath =
      "../code-timechart/output/passRatio/" +
      studentNumber +
      "/cv0" +
      sid +
      "passRatio.txt";
    const tablePath =
      "../code-timechart/output/failedTestLifeTime/" +
      studentNumber +
      "/cv0" +
      sid +
      "failedTestLifeTime.txt";
    const timelinePath =
      "../code-timechart/output/failedTestLifeTime/" +
      studentNumber +
      "/cv0" +
      sid +
      "timeline.txt";
    const testDistributedPath = "./output/testDistributed.json";
    if (!fs.existsSync(htmlPath)) {
      console.log(`not exists ${htmlPath}`);
      return;
    }
    if (!fs.existsSync(passRatioPath)) {
      console.log(`not exist ${passRatioPath}`);
      return;
    }
    if (!fs.existsSync(tablePath)) {
      console.log(`not exist ${tablePath}`);
      return;
    }
    if (!fs.existsSync(testDistributedPath)) {
      console.log(`not exists ${testDistributedPath}`);
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
    const jsonData = fs.readFileSync(testDistributedPath, "utf8");
    const jsonResult = JSON.parse(jsonData);
    const target = jsonResult.find((item: JsonData) => item.sid == sid);
    const distributedTestNum: number = target.num;
    let maxNum: number = 0;
    const passRatioArray = passRatioData
      .split("\n")
      .filter((line) => line.trim() != "")
      .map((line) => {
        const [date, ratio, num] = line.split(",");
        if (maxNum < Number(num)) {
          maxNum = Number(num);
        }
        return [Number(date) / (1000 * 60), Number(ratio)];
      });
    const tableArray: [string, number][] = tableData
      .split("\n")
      .filter((line) => line.trim() != "")
      .map((line) => {
        const [name, timeStr] = line.split(",");
        const time = parseFloat(timeStr);
        return [name, time];
      });
    const maxElapsedTime: number = Number(
      passRatioArray[passRatioArray.length - 1][0]
    );
    const guidelineData = createGuidelineData(distributedTestNum, maxNum);
    const adjustedData = adjustDataForElapsedTime(
      guidelineData,
      maxElapsedTime
    );
    const data = JSON.stringify(passRatioArray);
    const result = htmlData
      .replace(dataReplacePattern, data)
      .replace(modelReplacePattern, JSON.stringify(adjustedData))
      .replace(tableReplacePattern, JSON.stringify(tableArray))
      .replace(timelineReplacePattern, timelineData);
    fs.writeFileSync(htmlPath, result, "utf-8");
  }
}
function createGuidelineData(
  distributedTests: number,
  maxTests: number
): number[][] {
  const guidelineData: number[][] = [];
  for (let i = 0; i <= distributedTests; i++) {
    const fraction = toFraction(i, distributedTests);
    guidelineData.push([fraction]);
  }
  for (
    let denominator = distributedTests + 1;
    denominator <= maxTests;
    denominator++
  ) {
    const numerator = denominator - 1;
    if (numerator >= 0) {
      const fraction = toFraction(numerator, denominator);
      guidelineData.push([fraction]);
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
createGoogleChartLater();
