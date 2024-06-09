import { TestEvent } from "./analyzeTestResults";
import { EditEvent } from "./analyzeEditActivity";
import { RunEvent } from "./analyzeRunResults";
import { WSEvent } from "./analyzeWS";

export interface State {
  type: String;
  info: EditEvent | TestEvent | RunEvent | WSEvent;

  // event: String,
  // Only Reading/Editting can be identified by only EditLog
  // State Type Examples:
  //   Reading, Editting,
  //   Compiling(check syntax error),
  //   Executing(check execution),
  //   Testing(check component error),
  //   Debugging(fixing bugs),
  //   Refactoring(modify code keeping code behavior)
  //   others??
  // filePath: String,
  // fileName: String,
  // lineStart: String
  // lineEnd: String

  datetimeStart: Date;
  datetimeEnd: Date;
  estimateTimeStart: number;
  estimateTimeEnd: number;
  duration: number;
}

/**
 * Calculate estimated time from logging start time
 *
 * @param stateList
 * @returns
 */
export async function calculateEstimateTime(
  stateList: State[]
): Promise<State[]> {
  // sort by beginDate
  stateList.sort((a: State, b: State) => {
    if (a.datetimeStart.getTime() > b.datetimeStart.getTime()) {
      return 1;
    } else if (a.datetimeStart.getTime() == b.datetimeStart.getTime()) {
      return 0;
    } else {
      return -1;
    }
  });

  let previousState: State | undefined = undefined;
  let estimate = 0;
  for (const state of stateList) {
    if (
      previousState != undefined &&
      state.datetimeStart.getTime() > previousState.datetimeStart.getTime()
    ) {
      const timeBetweenT1SandT2S =
        state.datetimeStart.getTime() - previousState.datetimeStart.getTime();
      if (timeBetweenT1SandT2S > previousState.duration) {
        // when these 2 data are happened on parallel
        estimate += previousState.duration;
      } else {
        estimate += timeBetweenT1SandT2S;
      }
    }
    state.estimateTimeStart = estimate;
    state.estimateTimeEnd = estimate + state.duration;
    previousState = state;
  }
  return stateList;
}
