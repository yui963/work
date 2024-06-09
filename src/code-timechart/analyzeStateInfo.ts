import * as fs from "fs-extra";
import { join } from "path";
import { State, calculateEstimateTime } from "./State";
import { analyzeEditLog, EditEvent } from "./analyzeEditActivity";
import { analyzeTestResultLog } from "./analyzeTestResults";
import { analyzeRunResultLog } from "./analyzeRunResults";
import { KokokonoLabsLogFormatter } from "./constants";
import { getDataInfo, targetData } from "./dataInfo";
import { analyzeWSLog } from "./analyzeWS";

async function createStateList(
  logDirPath: String,
  runResultDirName: String
): Promise<State[]> {
  let stateList: State[] = [];

  // analyze Edit-Activity
  const editLogDirPath =
    logDirPath + "/" + KokokonoLabsLogFormatter.EDIT_LOG_DIR;
  let editLogStateList = await analyzeEditLog(editLogDirPath);
  stateList = stateList.concat(editLogStateList);

  // analyze Test-Results
  const testResultDirPath =
    logDirPath + "/" + KokokonoLabsLogFormatter.TEST_LOG_DIR;
  let testResultStateList = await analyzeTestResultLog(testResultDirPath);
  stateList = stateList.concat(testResultStateList);

  // analyze Run-Results
  const runResultDirPath = logDirPath + "/" + runResultDirName;
  let runResultStateList = await analyzeRunResultLog(runResultDirPath);
  stateList = stateList.concat(runResultStateList);

  // analyze WS-History
  const wsHistoryPath =
    logDirPath + "/" + KokokonoLabsLogFormatter.WORKSPACE_HISTORY_DIR;
  let wsStateList = await analyzeWSLog(wsHistoryPath);
  stateList = stateList.concat(wsStateList);

  // order by datetime
  stateList = await calculateEstimateTime(stateList);

  return stateList;
}

/**
 * Count State by Type
 *
 * @param stateList
 * @returns
 */
async function countState(stateList: State[]) {
  let stateCount: any = {};
  for (const s of stateList) {
    if (s.type.toString() in stateCount) {
      stateCount[s.type.toString()] += 1;
    } else {
      stateCount[s.type.toString()] = 0;
    }
  }
  stateCount["total"] = stateList.length;
  return stateCount;
}

export interface JsonInfo {
  data: StateInfo[];
}
export interface StateInfo {
  id: String;
  session: String;
  stateList: State[];
}

const args: string[] = process.argv.slice(2);
// export const stateInfoJsonPath = `./output/stateInfoList${Number(args[0])}.json`;
export const stateInfoJsonPath = join(
  process.cwd(),
  "output",
  `stateInfoList${args[0]}.json`
);

export async function analyzeStateInfo() {
  const args: string[] = process.argv.slice(2);
  const targetData: targetData = await getDataInfo(args[0]);

  // let id = 0;
  const stateInfoList: StateInfo[] = [];
  const jsonInfoList: JsonInfo = {
    data: [],
  };
  for (const dataByPerson of targetData.data) {
    // const idStr = ("0000" + id).slice(-4);
    const idStr = ("00000000" + dataByPerson.sid).slice(-8);
    for (const sessionData of dataByPerson.dataList) {
      console.log("\n");
      console.log("Analyzing: " + sessionData.path);

      const stateList: State[] = await createStateList(
        sessionData.path,
        sessionData.runResultsType
      );

      console.log("State: ");
      console.log(await countState(stateList));
      const result: StateInfo = {
        id: idStr,
        session: sessionData.session,
        stateList: stateList,
      };
      stateInfoList.push(result);
    }
    jsonInfoList.data = stateInfoList;
    // id++;
  }
  fs.ensureFileSync(stateInfoJsonPath);
  fs.writeFileSync(stateInfoJsonPath, JSON.stringify(jsonInfoList));
}

if (typeof require !== "undefined" && require.main === module) {
  analyzeStateInfo();
}
