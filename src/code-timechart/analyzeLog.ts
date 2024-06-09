import { analyzeStateInfo } from "./analyzeStateInfo";
import { createChartByIDandSession } from "./createGoogleTimeChart";
import { calcAllIndicators } from "./calcIndicator"

// analyzeStateInfo() uses student ID Arguments,
// because Reduce the amount of memory consumed per run.
async function main() {
    // await analyzeStateInfo();
    // await createChartByIDandSession();
    await calcAllIndicators();
}

if (typeof require !== "undefined" && require.main === module) {
    main();
}
