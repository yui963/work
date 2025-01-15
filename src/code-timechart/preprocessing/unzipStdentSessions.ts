/**
 * したいこと
 * ・セッションファイルのunzip
 * 1.unzip済みファイルの出力（jsonで追加出力していく）（追加出力難しそうなら，読み込んで型にはめてから追加して再度出力する）
 * 2.unzip済みjsonファイルを見てzipフォルダをサーチ&判定する
 * 3.unzipをかける
 *
 * json
 * {
 *  data:[{
 *   "studentID": 70110011,
 *   "session": [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0]
 *   }
 *  },...]
 * }
 */

import * as fs from "fs-extra";
import * as path from "path";
import * as compressing from "compressing";
import { getSubZipFiles, getSubdirectories } from "./common";
import { KokokonoLabsLogFormatter } from "./constants";
import { setSessionNo } from "./getUnzipedSessionNo";
//destが解凍先
const SOURCE_STRAGE: string = "H:";
const DEST_STRAGE: string = "G:";

const DEST_FOLDERSNAME: string = "All";
const foldersNameDir: string = path.join(
  KokokonoLabsLogFormatter.FOLDERS,
  `FoldersName2024${DEST_FOLDERSNAME}.txt`
);
const foldersNamePath: string = path.join(DEST_STRAGE, foldersNameDir);
let sidList: string[] = fs
  .readFileSync(foldersNamePath, "utf-8")
  .split("\r\n")
  .filter(Boolean); // Mac は "\n"
if (sidList[0].length > 9) {
  sidList = fs
    .readFileSync(foldersNamePath, "utf-8")
    .split("\n")
    .filter(Boolean);
}

interface ProgressEntry {
  studentID: string;
  progress: number[];
}
interface DataEntry {
  studentID: string;
  session: number[];
}
interface TargetData {
  data: DataEntry[];
}

async function unzip(filepath: string, destdir: string): Promise<void> {
  return new Promise(async (resolve, reject) => {
    try {
      console.log(`Start: ${filepath}`);
      await fs.promises.mkdir(destdir, { recursive: true });
      await compressing.zip.uncompress(filepath, destdir);
      console.log(`Succs: ${filepath} to ${destdir}`);
      resolve();
    } catch (e: any) {
      console.error(`Error: ${e.message}`);
      reject(e);
    }
  });
}

function arrayDiff(left: ProgressEntry, right: DataEntry, sid: string) {
  try {
    const mustUnzip: number[] = [];
    for (let i = 0; i < 14; i++) {
      const hoge = left.progress[i] - right.session[i];
      if (hoge === 1) {
        mustUnzip.push(i + 1);
      } else if (hoge === 0) {
        continue;
      } else {
        console.warn(
          `Warn: getMustUnzip(): ${hoge}: check file ${sid}/${right.session[i]}`
        );
      }
    }
    if (mustUnzip === null) console.log(`${sid} has no Additional submissions`);
    return mustUnzip;
  } catch (err: any) {
    console.error(`Error: arrayDiff(): ${err.message}`);
    return [];
  }
}

function getSessionFolderNo(filePath: string): number {
  const patterns = [
    /miniCV(\d{2})forStudent/,
    /cv(\d{2})/,
    /CV(\d{2})/,
    /minicv(\d{2})/,
    /miniCV(\d{2})/,
    /cv(\d{2})-.*-log-\d{4}.\d{2}.\d{2}/,
    /\d{8}-.*cv(\d{2})/,
    /miniCV(\d{2})-main/,
  ];

  const fileName: string = path.basename(filePath);
  for (let pattern of patterns) {
    const match = fileName.match(pattern);
    if (match) {
      const matchedNumber: number = Number(match[1]);
      return matchedNumber;
    }
  }
  return 0;
}

export function getZipSessionNo(file: string, matchNo: number[]) {
  const patterns = [
    /miniCV(\d{2})forStudent*/,
    /cv(\d{2}).zip/,
    /CV(\d{2}).zip/,
    /minicv(\d{2}).zip/,
    /miniCV(\d{2}).zip/,
    /cv(\d{2})-.*-log-\d{4}.\d{2}.\d{2}.zip/,
    // /^(?!.*.)(\d{2})(?!.*.).zip/,
    /(\d{2}).zip/,
    /\d{8}-.*cv(\d{2})/,
    /cv(\d{2})-kokokonolabs-log/,
  ];
  const zipPattern: RegExp = /\.zip$/;
  if (zipPattern.test(file)) {
    for (let pattern of patterns) {
      const match = file.match(pattern);
      if (match) {
        const matchedNumber: number = Number(match[1]);
        for (const No of matchNo) {
          if (matchedNumber === No) return true;
        }
      }
    }
  }
  return false;
}

async function updateUnzipedDataToJson(output: string) {
  const target: TargetData = {
    data: [],
  };

  for (const sid of sidList) {
    const sidPath: string = path.join(
      DEST_STRAGE,
      KokokonoLabsLogFormatter.UNZIPS,
      sid
    );
    const unzipedSessionList: string[] = await getSubdirectories(sidPath);
    const unzipedSessionNo: number[] = [];
    for (const unzipedSession of unzipedSessionList) {
      const sessionNo: number = getSessionFolderNo(unzipedSession);
      unzipedSessionNo.push(sessionNo);
    }
    const unzipedList: number[] = setSessionNo(unzipedSessionNo);
    const dataEntry: DataEntry = {
      studentID: sid,
      session: unzipedList,
    };
    target.data.push(dataEntry);
  }
  fs.writeFileSync(output, JSON.stringify(target));
}

async function main() {
  const errorBuffer: string[] = [];
  const progressJsonPath: string = path.join(
    process.cwd(),
    "output",
    "stdntProgress.json"
  );
  const unzipedJsonPath: string = path.join(
    process.cwd(),
    "output",
    "unziped.json"
  );

  // unziped folder List to JSON.
  await updateUnzipedDataToJson(unzipedJsonPath);

  // progress zip file list from JSON
  const progressJsonBuffer = fs.readFileSync(progressJsonPath);
  const progressInfoJson = JSON.parse(progressJsonBuffer.toString());
  const progressInfoArray = progressInfoJson.data as ProgressEntry[];
  // unziped file list from JSON
  const unzipedJsonBuffer = fs.readFileSync(unzipedJsonPath);
  const unzipedInfoJson = JSON.parse(unzipedJsonBuffer.toString());
  const unzipedInfoArray = unzipedInfoJson.data as DataEntry[];

  // Const Must unzip TargetData
  const unzipTarget: DataEntry[] = [];
  // Taking [progress - unziped] Diff.
  // take out same studentID info
  for (const zip of progressInfoArray) {
    for (const unzip of unzipedInfoArray) {
      if (zip.studentID === unzip.studentID) {
        const mustUnzip = arrayDiff(zip, unzip, zip.studentID);
        const dataEntry: DataEntry = {
          studentID: zip.studentID,
          session: mustUnzip,
        };
        unzipTarget.push(dataEntry);
      }
    }
  }
  // Output unzipTarget as JSON file? -> Make Json for Formatter

  for (const item of unzipTarget) {
    const sourceSidPath: string = path.join(SOURCE_STRAGE, item.studentID);
    const zipfileList: string[] = await getSubZipFiles(sourceSidPath);
    console.log(sourceSidPath);
    // judge zipfile name unzipTarget
    for (const zipfile of zipfileList) {
      for (const target of unzipTarget) {
        if (
          item.studentID === target.studentID &&
          getZipSessionNo(zipfile, target.session)
        ) {
          const zipPath: string = path.join(sourceSidPath, zipfile);
          const destPath: string = path.join(
            DEST_STRAGE,
            KokokonoLabsLogFormatter.UNZIPS,
            target.studentID
          );
          try {
            await unzip(zipPath, destPath);
          } catch (err: any) {
            errorBuffer.push(err.message);
          }
        }
      }
    }
  }
  await updateUnzipedDataToJson(unzipedJsonPath);
}

main();
