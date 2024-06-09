import * as fs from "fs-extra";
import * as path from "path";
import { createGoogleTimeChart } from "./GoogleTimeChart";
import { StateInfo, stateInfoJsonPath } from "./analyzeStateInfo";

export async function createChartByIDandSession() {
  // const outputChartDir = "./output/chart/";
  const outputChartDir = path.join(process.cwd(), "output", "chart");
  const stateInfoJsonBuffer = fs.readFileSync(stateInfoJsonPath);
  const stateInfoJson = JSON.parse(stateInfoJsonBuffer.toString());
  const stateInfoArray: StateInfo[] = stateInfoJson.data;

  for (const item of stateInfoArray) {
    const stateInfo = item as StateInfo;
    const chartFileBase = "" + stateInfo.id + "-" + stateInfo.session;
    const header = "ID: " + stateInfo.id + ", Session: " + stateInfo.session
    console.log("Create Chart: " + "ID: " + stateInfo.id + ", Session: " + stateInfo.session)

    const templatePath: string = path.join(process.cwd(), "chart-template", "chart-template.txt");
    const chartFilePath: string = path.join(outputChartDir, `chart${chartFileBase}.html`);

    // create chart
    createGoogleTimeChart(header, stateInfo.stateList, {'timeFormat': 'estimate'}, templatePath, chartFilePath);
    // createGoogleTimeChart(header, stateInfo.stateList, {'timeFormat': 'estimate'}, "./chart-template/chart-template.txt", outputChartDir + "/chart" + chartFileBase + ".html")
    // createGoogleTimeChart(header, stateInfo.stateList, {'timeFormat': 'date'}, "./chart-template/chart-template-date.txt", outputChartDir + "/chartDate" + chartFileBase + ".html")
  }
}

if (typeof require !== "undefined" && require.main === module) {
  createChartByIDandSession();
}

