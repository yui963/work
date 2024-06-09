import * as fs from "fs-extra";
import * as readline from "readline";
import {
  getFileNameFromFilePath,
  convertDateFromDirectoryName,
} from "./common";
import { State } from "./State";

export interface TestTree {
  testClassName: String;
  testMethodNameList: String[];
}

/**
 * Test Event analyzed from "test-results/"
 *
 * When type is ${symbol-class}, some testing methods was invoked.
 *   e.g. %NAME,Launch Java Tests - $(symbol-method) numberMax1()
 * In this case, invoked testing method is 1 testing method like "numberMax1()".
 *
 * When type is ${symbol-method}, some testing classes were invoked.
 *   e.g. %NAME,Launch Java Tests - $(symbol-class) SemanticCheckProgramTest_cv02
 * In this case, invoked testing method is not only 1 testing method.
 * These includes NOT ONLY testing methods in the class (like "SemanticCheckProgramTest_cv02"),
 * but also other testing classes. That is "SemanticCheckProgramTest_cv02" means just one of the invoked testing classes.
 * It is because the learner can choose/invoke multiple testing classes in vscode's testing view in the same time.
 * So, analyzer should analyze #TSTTREE lines to identify invoked testing methods.
 *
 */
export interface TestEvent {
  invokedTestType: String; // $(symbol-class) or $(symbol-method)
  invokedTestSet: String;
  testTree: TestTree[];
  testingCase: String[];
  failedCase: String[];
  passRatio: number;
  invokedDate: Date;
}

async function createNewTestNode(
  testClassName: String,
  testMethodInfo: String
): Promise<TestTree> {
  const testCaseList: String[] = [];
  testCaseList.push(testMethodInfo);
  const newTestNode: TestTree = {
    testClassName: testClassName,
    testMethodNameList: testCaseList,
  };
  return newTestNode;
}

async function getTestResultLog(directory: string): Promise<TestEvent[]> {
  try {
    let testLog: TestEvent[] = [];
    const files = await fs.readdir(directory, { withFileTypes: true });
    console.log("File Num(Test Result): " + files.length);
    for (const file of files) {
      let invokedDate: Date | undefined = undefined;
      let filePath = directory + "/" + file.name;
      if (file.isDirectory() == true) {
        filePath = directory + "/" + file.name + "/test-results.txt";
        invokedDate = await convertDateFromDirectoryName(file.name);
      } else {
        const fileName = await getFileNameFromFilePath(filePath);
        invokedDate = await convertDateFromDirectoryName(
          fileName.replace(/\.txt$/, "")
        );
      }
      const rs: fs.ReadStream = fs.createReadStream(filePath);
      const ri = readline.createInterface({
        input: rs,
      });

      let invokedTestType: String | undefined = undefined;
      let invokedTestSet: String | undefined = undefined;
      let testTree: TestTree[] = [];
      let testingCase: String[] = [];
      let failedCase: String[] = [];

      let lineNo = 0;
      for await (const line of ri) {
        if (lineNo == 0 && line.match(/^%NAME/) != null) {
          const nameItems = line.split(/[ ,]/);
          invokedTestType = nameItems[5];
          invokedTestSet = nameItems[6];
        } else if (line.match(/^%TSTTREE/) != null) {
          const items = line.split(/,/);
          const testSetFlag = items[2];
          if (testSetFlag == "false") {
            const testMethodInfo = items[1];
            const testClassInfo = testMethodInfo.match(/\(.*\)/);
            if (testClassInfo != null) {
              const testClassName = testClassInfo[0]
                .replace(/^\(/, "")
                .replace(/\)$/, "");
              if (testTree.length == 0) {
                testTree.push(
                  await createNewTestNode(testClassName, testMethodInfo)
                );
              } else if (testTree.length > 0) {
                const latestTestNode = testTree[testTree.length - 1];
                if (latestTestNode.testClassName == testClassName) {
                  latestTestNode.testMethodNameList.push(testMethodInfo);
                } else {
                  testTree.push(
                    await createNewTestNode(testClassName, testMethodInfo)
                  );
                }
              }
            } else {
              console.log("Error: testClassInfo not found: " + testMethodInfo);
            }
          } else {
            // case 'true',
            // The line is information of testing class where some testing methods were implemented.
            // This does not have testing method information.
          }
        } else if (line.match(/^%TESTE/) != null) {
          const nameItems = line.split(/[,]/);
          testingCase.push(nameItems[1]);
        } else if (line.match(/^%FAILED/) != null) {
          const nameItems = line.split(/[,]/);
          failedCase.push(nameItems[1]);
        }
        lineNo++;
      }
      ri.close();
      rs.close();

      if (invokedTestType != undefined && invokedTestSet != undefined) {
        const passRatio =
          ((testingCase.length - failedCase.length) / testingCase.length) * 100;
        const te: TestEvent = {
          invokedTestType: invokedTestType,
          invokedTestSet: invokedTestSet,
          testTree: testTree,
          testingCase: testingCase,
          failedCase: failedCase,
          passRatio: passRatio,
          invokedDate: invokedDate,
        };
        testLog.push(te);
      }
    }
    return testLog;
  } catch (error: any) {
    const msg = `Error: getTestResultLogFiles(): ${error.message} in ${directory}`;
    console.log(msg);
    return [];
  }
}

async function analyzeTestState(testLog: TestEvent[]): Promise<State[]> {
  let stateList: State[] = [];
  for (const event of testLog) {
    const state: State = {
      type: "test",
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

export async function analyzeTestResultLog(
  testResultLogDirPath: string
): Promise<State[]> {
  const testLog: TestEvent[] = await getTestResultLog(testResultLogDirPath);
  console.log("TestEvent Num: " + testLog.length);
  // console.log(testLog)

  const stateList: State[] = await analyzeTestState(testLog);
  return stateList;
}

async function main() {
  const logDirPath =
    "./data/70110005/miniCV01forStudent2023/kokokonolabs-log-fv01";
  const testResultDirPath = logDirPath + "/test-results";
  let testResultStateList = await analyzeTestResultLog(testResultDirPath);
  // console.log(testResultStateList)
}

if (typeof require !== "undefined" && require.main === module) {
  main();
}
