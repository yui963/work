function toFraction(numerator: number, denominator: number): number {
  return denominator === 0 ? 0 : numerator / denominator;
}

function createGuidelineData(
  distributedTests: number,
  maxTests: number
): number[][] {
  const guidelineData: number[][] = [];

  // 最初のデータ: 0/配布された数、1/配布された数、2/配布された数、...、配布された数/配布された数
  for (let i = 0; i <= distributedTests; i++) {
    const fraction = toFraction(i, distributedTests);
    guidelineData.push([fraction]);
  }

  // 次のデータ: 分母は配布された数から始まり、順次 +1 ずつ増加
  for (
    let denominator = distributedTests + 1;
    denominator <= maxTests;
    denominator++
  ) {
    // 分子は分母から1引いた値
    const numerator = denominator - 1;
    if (numerator >= 0) {
      // 分子と分母の比率
      const fraction = toFraction(numerator, denominator);
      guidelineData.push([fraction]);
    }
    // 分母/分母の比率
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

// 使用例
const distributedTests = 5;
const maxTests = 10;
const maxElapsedTime = 100;
const guidelineData = createGuidelineData(distributedTests, maxTests);
const adjustedData = adjustDataForElapsedTime(guidelineData, maxElapsedTime);

console.log(adjustedData);
