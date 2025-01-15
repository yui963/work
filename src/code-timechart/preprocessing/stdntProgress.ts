// 汚い実装はご愛嬌^^
import * as createCsvWriter from "csv-writer";
import * as fs from "fs-extra";
import * as path from "path";
import { sum } from "simple-statistics";
import { KokokonoLabsLogFormatter } from "./constants";
import { getSubZipFiles } from "./common";

class Student {
  studentID: string;
  progress: number[];

  constructor(studentNumber: string, progress: number[]) {
    this.studentID = studentNumber;
    this.progress = progress;
  }
}
interface targetData {
  data: Student[];
}

// ここは変えてください mac->'/Volumes/DRIVE'
const SOURCE_STRAGE: string = "H:";
const DEST_STRAGE: string = "G:";

// const foldersNameDir: string = `FoldersName/FoldersName${process.argv[2]}.txt`;
const foldersNamePath: string = path.join(
  DEST_STRAGE,
  KokokonoLabsLogFormatter.FOLDERS,
  `FoldersName2024All.txt`
);
const studentIDList = fs.readFileSync(foldersNamePath, "utf-8").split("\n");

const students: Student[] = [];
const csvWriter = createCsvWriter.createObjectCsvWriter({
  path: "output/stdntProgress.csv",
  header: [
    { id: "sid", title: "sid" },
    { id: "session1", title: "session1" },
    { id: "session2", title: "session2" },
    { id: "session3", title: "session3" },
    { id: "session4", title: "session4" },
    { id: "session5", title: "session5" },
    { id: "session6", title: "session6" },
    { id: "session7", title: "session7" },
    { id: "session8", title: "session8" },
    { id: "session9", title: "session9" },
    { id: "session10", title: "session10" },
    { id: "session11", title: "session11" },
    { id: "session12", title: "session12" },
    { id: "session13", title: "session13" },
    { id: "session14", title: "session14" },
  ],
});

/**
 * zipファイル名から実験番号を抽出する
 * @param {string} file - 対象の実験ファイルまでのパス
 * @returns {number} - 抽出された実験番号 zip以外は 0
 */
export function getZipSessionNo(file: string): number {
  const patterns = [
    /miniCV(\d{2})forStudent*/,
    /minicv(\d{2})forStudent*/,
    /cv(\d{2}).zip/,
    /CV(\d{2}).zip/,
    /minicv(\d{2}).zip/,
    /miniCV(\d{2}).zip/,
    /cv(\d{2})-.*-log-\d{4}.\d{2}.\d{2}.zip/,
    // /^(?!.*.)(\d{2})(?!.*.).zip/,
    /(\d{2}).zip/,
    /\d{8}-.*cv(\d{2})/,
    /cv(\d{2})-kokokonolabs-log/,
    /miniCV(\d{2})-main.zip/,
  ];
  const zipPattern: RegExp = /\.zip$/;
  // const startDotPattern: RegExp = /^[^.].*$/;

  const basename: string = path.basename(file);
  // .zip ファイル以外は無視
  if (zipPattern.test(basename)) {
    for (let pattern of patterns) {
      const match = basename.match(pattern);
      if (match) {
        const matchedNumber: number = Number(match[1]);
        return matchedNumber;
      }
    }
  }
  return 0;
}

/**
 * 指定されたディレクトリ内の各ファイル名に対して実験番号を抽出し、
 * マッチした実験番号のリストを返します。
 * @param {string} sourcePath - 検証対象のディレクトリのパス。
 * @returns {string[]} - マッチした実験番号のリスト。
 */
async function getSessionNoList(sourcePath: string): Promise<number[]> {
  try {
    const fileList = await getSubZipFiles(sourcePath);
    const sessionNoList: number[] = [];
    for (const file of fileList) {
      if (file.includes("._")) continue;
      const sessionNo = getZipSessionNo(file);
      if (sessionNo === 0) {
        console.log(`Not matched filename: ${path.join(sourcePath, file)}`);
      }
      sessionNoList.push(sessionNo);
    }
    return sessionNoList;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(`Error reading directory: ${error.message}`);
    } else {
      console.error(`An unknown error occurred: ${error}`);
    }
    return [];
  }
}

/**
 * 配列に格納されている数値をインデックスとして配列に1を格納して返す
 * @param {string} sessionList - 変換対象のNumber配列
 * @returns {string[]} - 対象をインデックスとして1を格納した配列
 */
function setSessionNo(sessionList: number[]): number[] {
  const sessionArray: number[] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  for (const session of sessionList) {
    sessionArray[session - 1] = 1;
  }
  return sessionArray;
}

async function fetchSessionNumber() {
  for (const studentID of studentIDList) {
    const studentIDPath: string = path.join(SOURCE_STRAGE, studentID.trim());
    const sessionList = await getSessionNoList(studentIDPath);
    const converted = setSessionNo(sessionList);
    students.push(new Student(studentID.trim(), converted));
  }
}

async function writeCSV() {
  const records = students.map((student) => ({
    sid: student.studentID,
    session1: student.progress[0],
    session2: student.progress[1],
    session3: student.progress[2],
    session4: student.progress[3],
    session5: student.progress[4],
    session6: student.progress[5],
    session7: student.progress[6],
    session8: student.progress[7],
    session9: student.progress[8],
    session10: student.progress[9],
    session11: student.progress[10],
    session12: student.progress[11],
    session13: student.progress[12],
    session14: student.progress[13],
  }));
  csvWriter
    .writeRecords(records)
    .then(() => console.log("CSVファイルが正常に生成されました。"))
    .catch((err) => console.error("エラーが発生しました:", err));
}

async function writeProgressJson() {
  const jsonPath: string = path.join(
    process.cwd(),
    "output",
    "stdntProgress.json"
  );
  const info: targetData = {
    data: students,
  };
  await fs.writeFile(jsonPath, JSON.stringify(info));
}

async function calcSession() {
  const jsonPath: string = path.join(
    process.cwd(),
    "output",
    "stdntProgress.json"
  );
  const progressJsonBuffer = await fs.readFile(jsonPath);
  const progressInfoJson = JSON.parse(progressJsonBuffer.toString());
  const progressInfoArray = progressInfoJson.data as Student[];

  const result: number[] = new Array(progressInfoArray[1].progress.length).fill(
    0
  );
  for (const progress of progressInfoArray) {
    progress.progress[3];
    for (let i = 0; i < progress.progress.length; i++) {
      result[i] += progress.progress[i];
    }
  }
  for (let i = 0; i < result.length; i++) {
    console.log(`session${i + 1}: ${result[i]}`);
  }
  console.log(`session total: ${sum(result)}`);
}

async function studentProgress() {
  await fetchSessionNumber();
  await writeCSV();
  await writeProgressJson();
  await calcSession();
}
studentProgress();
