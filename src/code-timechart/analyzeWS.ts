import * as fs from "fs-extra";
import path from "path";
import { State } from "./State";
import {
  convertDateFromDirectoryName,
  getFileNameFromFilePath,
  isProductCode,
  isTestCode,
} from "./common";

/**
 * Run Event analyzed from "run-results/" or "debug-sessions"
 */
export interface WSEvent {
  date: Date;
  lineNo: number;
  fileNo: number;
  main: {
    lineNo: number;
    fileNo: number;
  };
  test: {
    lineNo: number;
    fileNo: number;
    testCaseNo: number;
  };
}

async function analyzeWSState(wsLog: WSEvent[]): Promise<State[]> {
  let stateList: State[] = [];
  for (const event of wsLog) {
    const state: State = {
      type: "ws",
      info: event,
      datetimeStart: event.date,
      datetimeEnd: event.date,
      estimateTimeStart: 0, // calculate in after process
      estimateTimeEnd: 0, // calculate in after process
      duration: 0,
    };
    stateList.push(state);
  }
  return stateList;
}

function countupFiles(dirpath: string, callback: (fp: string) => void) {
  const dirents = fs.readdirSync(dirpath, { withFileTypes: true });
  for (const dirent of dirents) {
    const fp = path.join(dirpath, dirent.name);
    if (dirent.isDirectory()) {
      countupFiles(fp, callback);
    } else {
      callback(fp);
    }
  }
}

async function createWSInfo(
  wsHistDirectoryPath: string
): Promise<WSEvent | undefined> {
  let srcPath = wsHistDirectoryPath + "/workspace/src";
  if (fs.existsSync(srcPath) != true) {
    srcPath = wsHistDirectoryPath + "/src";
    if (fs.existsSync(srcPath) != true) {
      return undefined;
    }
  }

  const dateDirName = await getFileNameFromFilePath(wsHistDirectoryPath);
  let date: Date = await convertDateFromDirectoryName(dateDirName);
  let fileNo = 0;
  let lineNo = 0;
  let mainFileNo = 0;
  let mainLineNo = 0;
  let testFileNo = 0;
  let testLineNo = 0;
  let testCaseNo = 0;
  countupFiles(srcPath, (fp: string) => {
    const context = fs.readFileSync(fp);
    const lineCount = context.toString().split("\n").length;
    lineNo += lineCount;
    fileNo++;

    if (isProductCode(fp)) {
      mainFileNo++;
      mainLineNo += lineCount;
    } else if (isTestCode(fp)) {
      testFileNo++;
      testLineNo += lineCount;
      const contextLines = context.toString().split("\n");
      fs.closeSync(fs.openSync(fp, "r"));
      let testCaseCount = 0;
      for (const line of contextLines) {
        if (line.includes("@Test")) {
          testCaseCount++;
        }
      }
      testCaseNo += testCaseCount;
    } else {
      // console.log("Other Code: " + fp)
    }
  });

  const we: WSEvent = {
    //infoにこれが入る
    date: date,
    lineNo: lineNo,
    fileNo: fileNo,
    main: {
      lineNo: lineNo,
      fileNo: fileNo,
    },
    test: {
      lineNo: testLineNo,
      fileNo: testFileNo,
      testCaseNo: testCaseNo,
    },
  };
  return we;
}

async function getWSLog(directory: string): Promise<WSEvent[]> {
  let wsLog: WSEvent[] = [];
  try {
    const files = await fs.readdir(directory, { withFileTypes: true });
    console.log("File Num(ws-history): " + files.length);
    for (const file of files) {
      let wsHistoryDirectoryPath = directory + "/" + file.name;
      if (file.isDirectory() != true) {
        continue;
      }
      const we: WSEvent | undefined = await createWSInfo(
        wsHistoryDirectoryPath
      );
      if (we != undefined) {
        wsLog.push(we);
      }
    }
    return wsLog;
  } catch (error: any) {
    const msg = `Error: getWSLog(): ${error.message} in ${directory}`;
    console.log(msg);
    return wsLog;
  }
}

export async function analyzeWSLog(wsLogDir: string): Promise<State[]> {
  const wsLog: WSEvent[] = await getWSLog(wsLogDir);
  console.log("WSInfo Num: " + wsLog.length);

  const stateList: State[] = await analyzeWSState(wsLog);
  return stateList;
}

async function main() {
  const testResultDirPath1 =
    "data/70110005/miniCV01forStudent2023/kokokonolabs-log-fv01/ws-history";
  const testResultDirPath2 = "data/70110043/cv04/kokokonolabs-log/ws-history";
  // let testResultStateList1 = await analyzeWSLog(testResultDirPath1);
  let testResultStateList2 = await analyzeWSLog(testResultDirPath2);
  // console.log(testResultStateList1)
  console.log(testResultStateList2);
  for (const s of testResultStateList2) {
    if (s.type == "ws") {
      const x: WSEvent = s.info as WSEvent;
      console.log("FILE: " + x.test.fileNo);
      console.log("TEST: " + x.test.testCaseNo);
    }
  }
}

if (typeof require !== "undefined" && require.main === module) {
  main();
}
