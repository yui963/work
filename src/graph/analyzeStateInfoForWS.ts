import * as fs from "fs";
import * as path from "path";
import {
  StateInfo,
  stateInfoJsonPath,
} from "../code-timechart/analyzeStateInfo";
import { WSEvent } from "../code-timechart/analyzeWS";
export interface DateAndEstimate {
  date: Date;
  estimate: number;
}
export function analyzeStateInfoForWS(): DateAndEstimate[] {
  const stateInfoJsonBuffer = fs.readFileSync(stateInfoJsonPath);
  const stateInfoJson = JSON.parse(stateInfoJsonBuffer.toString());
  const stateInfoArray: StateInfo[] = stateInfoJson.data;
  const dateAndEstimateArray: DateAndEstimate[] = [];
  for (const item of stateInfoArray) {
    const stateInfo = item as StateInfo;
    const session = stateInfo.session;
    const id = stateInfo.id;
    const stateList = stateInfo.stateList;
    for (const state of stateList) {
      const event: WSEvent = state.info as WSEvent;
      if (state.type == "ws") {
        dateAndEstimateArray.push({
          date: event.date,
          estimate: state.estimateTimeStart,
        });
      }
    }
  }
  return dateAndEstimateArray;
}
