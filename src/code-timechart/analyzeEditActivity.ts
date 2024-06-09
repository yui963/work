import * as fs from "fs-extra";
import * as readline from "readline";
import {
  convertDateFromDirectoryName,
  getFileNameFromFilePath,
} from "./common";
import { State } from "./State";

export interface EditEvent {
  datetime: Date;
  eventName: String;
  filePath: String;
  fileName: String;
  lineStart: String;
  lineEnd: String;
}

async function getEditLog(directory: string): Promise<EditEvent[]> {
  try {
    let editLog: EditEvent[] = [];
    const files = await fs.readdir(directory, { withFileTypes: true });
    console.log("File Num(Edit Activity): " + files.length);
    for (const file of files) {
      const filePath = directory + "/" + file.name;
      const rs: fs.ReadStream = fs.createReadStream(filePath);
      const ri = readline.createInterface({
        input: rs,
      });
      for await (const line of ri) {
        const items: string[] = line.split(",");
        const datetime = await convertDateFromDirectoryName(items[0]);
        const filePath = items[2];
        const fileName = await getFileNameFromFilePath(filePath);
        const e: EditEvent = {
          datetime: datetime,
          eventName: items[1],
          filePath: filePath,
          fileName: fileName,
          lineStart: items[3],
          lineEnd: items[4],
        };
        editLog.push(e);
      }
      ri.close();
      rs.close();
    }
    return editLog;
  } catch (error: any) {
    const msg = `Error: getEditLogFiles(): ${error.message} in ${directory}`;
    console.log(msg);
    return [];
  }
}

async function createState(
  event: EditEvent,
  datetimeEnd: Date
): Promise<State> {
  const duration = datetimeEnd.getTime() - event.datetime.getTime();
  const state: State = {
    type: "edit",
    info: event,
    datetimeStart: event.datetime,
    datetimeEnd: datetimeEnd,
    estimateTimeStart: 0, // calculate in after process
    estimateTimeEnd: 0, // calculate in after process
    duration: duration,
  };
  return state;
}

//
// Event List
//
// setEditLogger
// onDidCreateFiles
// onDidRenameFiles
// onDidChangeActiveTerminal
// onDidChangeActiveTextEditor
// changefocusedfile
// onDidChangeTextEditorSelection
// onDidChangeTextDocument
// changetextonthefile
// onDidSaveTextDocument
// onDidChangeTextEditorVisibleRanges
// onDidCloseTextDocument

/**
 * convert EditEvent[] to State[] with calculating duration between the events
 *
 * @param editLog
 * @returns
 */
async function analyzeEditState(editLog: EditEvent[]): Promise<State[]> {
  let stateList: State[] = [];
  let previousEvent: EditEvent | undefined = undefined;
  for (const e of editLog) {
    if (previousEvent == undefined) {
      previousEvent = e;
      continue;
    }

    let datetimeEnd = e.datetime;
    if (e.eventName == "setEditLogger") {
      // Do not set current event time as end time of the previous event
      // It is because when the event "setEditLogger" happend,
      // the looger started. That means the logger had suspended before.
      datetimeEnd = previousEvent.datetime;
    }

    const duration = datetimeEnd.getTime() - previousEvent.datetime.getTime();
    const limitSec = 30 * 60;
    if (duration > limitSec) {
      // If the duration of the event is more than 30 minutes,
      // set limitSec as the duration
      datetimeEnd = new Date(previousEvent.datetime.getTime() + limitSec);
    }

    const s: State = await createState(previousEvent, datetimeEnd);
    stateList.push(s);
    previousEvent = e;
  }
  return stateList;
}

export async function analyzeEditLog(editLogDirPath: string): Promise<State[]> {
  const editLog: EditEvent[] = await getEditLog(editLogDirPath);
  console.log("EditEvent Num: " + editLog.length);

  const stateList: State[] = await analyzeEditState(editLog);
  return stateList;
}
