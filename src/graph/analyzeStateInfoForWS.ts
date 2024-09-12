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
  writeDateAndEstimateToFile(dateAndEstimateArray, "./debug.txt");
  return dateAndEstimateArray;
}
function writeDateAndEstimateToFile(data: DateAndEstimate[], filePath: string) {
  // データを JSON 形式の文字列に変換
  const jsonString = JSON.stringify(
    data,
    (key, value) => {
      // Date オブジェクトを ISO 文字列に変換するためのリプレイサー
      if (value instanceof Date) {
        return value.toISOString();
      }
      return value;
    },
    2
  ); // 2 はインデントのスペース数

  // ファイルに書き込み
  fs.writeFileSync(filePath, jsonString, "utf8");
}
