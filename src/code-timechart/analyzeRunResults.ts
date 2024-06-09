import * as fs from "fs-extra";
import * as readline from "readline";
import { convertDateFromDirectoryName, getFileNameFromFilePath } from "./common";
import { State } from "./State";

/**
 * Run Event analyzed from "run-results/" or "debug-sessions"
 */
export interface RunEvent {
  name: String;
  invokedDate: Date;
}

async function getRunResultLog(directory: string): Promise<RunEvent[]> {
  try {
    let runLog: RunEvent[] = [];
    const files = await fs.readdir(directory, { withFileTypes: true });
    console.log("File Num(Run Result): " + files.length);
    for (const file of files) {
      let invokedDate: Date | undefined = undefined;
      let filePath = directory + "/" + file.name;
      if (file.isDirectory() == true) {
        filePath = directory + "/" + file.name + "/debugSession.txt";
        invokedDate = await convertDateFromDirectoryName(file.name);
      } else {
        const fileName = await getFileNameFromFilePath(filePath);
        invokedDate = await convertDateFromDirectoryName(fileName.replace(/\.txt$/, ""));
      }

      const rs: fs.ReadStream = fs.createReadStream(filePath);
      const ri = readline.createInterface({
        input: rs,
      });

      let invokedAppName: String | undefined = undefined;
      let lineNo = 0;
      for await (const line of ri) {
        if (line.match(/^Name: /) != null) {
          invokedAppName = line.replace(/^Name: /, "");
          break;
        }
        lineNo++;
      }
      ri.close();
      rs.close();

      if (
        invokedAppName == undefined ||
        invokedAppName.match(/^Launch Java Tests - /) != null
      ) {
        // Launch Test cases are analyzed by test-results log data.
        continue;
      }

      const re: RunEvent = {
        name: invokedAppName,
        invokedDate: invokedDate,
      };
      runLog.push(re);
    }
    return runLog;
  } catch (error: any) {
    const msg = `Error: getTestResultLogFiles(): ${error.message} in ${directory}`;
    console.log(msg);
    return [];
  }
}

async function analyzeRunState(runLog: RunEvent[]): Promise<State[]> {
  let stateList: State[] = [];
  for (const event of runLog) {
    const state: State = {
      type: "run",
      info: event,
      datetimeStart: event.invokedDate,
      datetimeEnd: event.invokedDate,
      estimateTimeStart: 0, // calculate in after process
      estimateTimeEnd: 0, // calculate in after process
      duration: 0,
    };
    stateList.push(state);
  }
  return stateList;
}

export async function analyzeRunResultLog(
  runResultLogDirPath: string
): Promise<State[]> {
  const runLog: RunEvent[] = await getRunResultLog(runResultLogDirPath);
  console.log("RunEvent Num: " + runLog.length);
  // console.log(runLog)

  const stateList: State[] = await analyzeRunState(runLog);
  return stateList;
}

async function main() {
  const testResultDirPath1 =
    "data/70110005/miniCV01forStudent2023/kokokonolabs-log-fv01/debug-sessions";
  const testResultDirPath2 = "data/70110043/cv05/kokokonolabs-log/run-results";
  let testResultStateList1 = await analyzeRunResultLog(testResultDirPath1);
  let testResultStateList2 = await analyzeRunResultLog(testResultDirPath2);
}

if (typeof require !== "undefined" && require.main === module) {
  main();
}
