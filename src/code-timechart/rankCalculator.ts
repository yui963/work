import * as fs from "fs-extra";
interface SessionResult {
  sid: string;
  sessionResults: StudentResult[];
}
interface StudentResult {
  id: string;
  testFirstProcessRate: number | null;
  avgTestLifeTime: number | null;
  avgDifferenceTestSum: number | null;
  avgPassRatioDifferent: number | null;
}
const studentResultJSONPath = "./output/studentResult.json";
export function writeTestFirstProcessResult(
  id: string,
  sid: string,
  rate: number
): void {
  const jsonData = readSessionResultJSON();
  const sessionData = findStudentResult(jsonData, sid);
  const targetStudent = findTargetStudentData(sessionData, id);
  targetStudent.testFirstProcessRate = rate;
  fs.writeFileSync(
    studentResultJSONPath,
    JSON.stringify(jsonData, null, 2),
    "utf-8"
  );
}
export function writeTestLifeTimeResult(
  id: string,
  sid: string,
  avgLifeTime: number
): void {
  const jsonData = readSessionResultJSON();
  const sessionData = findStudentResult(jsonData, sid);
  const targetStudent = findTargetStudentData(sessionData, id);
  targetStudent.avgTestLifeTime = avgLifeTime;

  fs.writeFileSync(
    studentResultJSONPath,
    JSON.stringify(jsonData, null, 2),
    "utf-8"
  );
}
export function writeAvgPassRatioDifferent(
  id: string,
  sid: string,
  avgPassRatioDifferent: number
): void {
  const jsonData = readSessionResultJSON();
  const sessionData = findStudentResult(jsonData, sid);
  const targetStudent = findTargetStudentData(sessionData, id);
  targetStudent.avgPassRatioDifferent = avgPassRatioDifferent;

  fs.writeFileSync(
    studentResultJSONPath,
    JSON.stringify(jsonData, null, 2),
    "utf-8"
  );
}
export function writeAvgDifferenceTestSum(
  id: string,
  sid: string,
  avgDifferenceTestSum: number
): void {
  const jsonData = readSessionResultJSON();
  const sessionData = findStudentResult(jsonData, sid);
  const targetStudent = findTargetStudentData(sessionData, id);
  targetStudent.avgDifferenceTestSum = avgDifferenceTestSum;

  fs.writeFileSync(
    studentResultJSONPath,
    JSON.stringify(jsonData, null, 2),
    "utf-8"
  );
}
function readSessionResultJSON(): SessionResult[] {
  if (!fs.existsSync(studentResultJSONPath)) {
    return [];
  }
  const jsonData = fs.readFileSync(studentResultJSONPath, "utf-8");
  return JSON.parse(jsonData);
}
function findStudentResult(
  jsonData: SessionResult[],
  sid: string
): StudentResult[] {
  const targetData = jsonData.find(
    (element: SessionResult) => element.sid == sid
  );
  if (!targetData) {
    const newSessionResult: SessionResult = {
      sid: sid,
      sessionResults: [],
    };
    jsonData.push(newSessionResult);
    return newSessionResult.sessionResults;
  }
  return targetData.sessionResults;
}
export function getTestFirstProcessRank(
  sid: string,
  id: string
): [number, number] {
  const jsonData = readSessionResultJSON();
  const sessionData = findStudentResult(jsonData, sid);
  const sortedStudents = sessionData.sort(
    (a, b) => (b.testFirstProcessRate ?? 0) - (a.testFirstProcessRate ?? 0)
  );
  const rank = sortedStudents.findIndex((student) => student.id === id) + 1;
  return [rank, sortedStudents.length];
}
export function getTestLifeTimeRank(sid: string, id: string): [number, number] {
  const jsonData = readSessionResultJSON();
  const sessionData = findStudentResult(jsonData, sid);
  const sortedStudents = sessionData.sort(
    (a, b) => (a.avgTestLifeTime ?? 0) - (b.avgTestLifeTime ?? 0)
  );
  const rank = sortedStudents.findIndex((student) => student.id === id) + 1;
  return [rank, sortedStudents.length];
}
export function getTestNumRank(sid: string, id: string): [number, number] {
  const jsonData = readSessionResultJSON();
  const sessionData = findStudentResult(jsonData, sid);
  const sortedStudents = sessionData.sort(
    (a, b) => (a.avgDifferenceTestSum ?? 0) - (b.avgDifferenceTestSum ?? 0)
  );
  const rank = sortedStudents.findIndex((student) => student.id === id) + 1;
  return [rank, sortedStudents.length];
}
export function getPassRatioRank(sid: string, id: string): [number, number] {
  const jsonData = readSessionResultJSON();
  const sessionData = findStudentResult(jsonData, sid);
  const sortedStudents = sessionData.sort(
    (a, b) => (a.avgDifferenceTestSum ?? 0) - (b.avgDifferenceTestSum ?? 0)
  );
  const rank = sortedStudents.findIndex((student) => student.id === id) + 1;
  return [rank, sortedStudents.length];
}
function createEmptyObject(id: string) {
  return {
    id: id,
    testFirstProcessRate: null,
    avgTestLifeTime: null,
    avgDifferenceTestSum: null,
    avgPassRatioDifferent: null,
  };
}
function findTargetStudentData(
  sessionData: StudentResult[],
  id: string
): StudentResult {
  let targetStudent = sessionData.find(
    (element: StudentResult) => element.id == id
  );
  if (!targetStudent) {
    targetStudent = createEmptyObject(id);
    sessionData.push(targetStudent);
  }

  return targetStudent;
}
