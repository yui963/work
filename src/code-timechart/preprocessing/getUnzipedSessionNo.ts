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
import * as path from 'path';
import { getSubdirectories } from './common';
import { KokokonoLabsLogFormatter } from './constants';

interface DataEntry {
    studentID: string;
    session: number[];
}
interface TargetData {
    data: DataEntry[];
}

function getSessionNo(filePath: string): number {
    const patterns = [
        /miniCV(\d{2})forStudent/,
        /cv(\d{2})/,
        /CV(\d{2})/,
        /minicv(\d{2})/,
        /miniCV(\d{2})/,
        /cv(\d{2})-.*-log-\d{4}.\d{2}.\d{2}/,
        /\d{8}-.*cv(\d{2})/,
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

async function getSessionNoList(folderList: string[]): Promise<number[]> {
    try {
        const sessionNoList: number[] = [];
        for (const folder of folderList) {
            if (folder.includes("._")) {
                continue;
            }
            sessionNoList.push(getSessionNo(folder));
        }
        return sessionNoList;
    } catch (error: any) {
        console.error(`Error: getSessionNoList(): ${error.message}`);
        return [];
    }
}

/**
 * 配列に格納されている数値をインデックスとして配列に1を格納して返す
 * @param {string} sessionList - 変換対象のNumber配列
 * @returns {string[]} - 対象をインデックスとして1を格納した配列
 */
export function setSessionNo(sessionList: number[]): number[] {
    const sessionArray: number[] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    for (const session of sessionList) {
        sessionArray[session - 1] = 1;
    }
    return sessionArray;
}

// unzipセッションリスト出す
export async function getUnzipedSessionList(sid: string, strageDir: string): Promise<DataEntry[]> {
    const unzipedDataList: DataEntry[] = [];
    const sidPath = path.join(strageDir, KokokonoLabsLogFormatter.UNZIPS, sid);
    const unzipedSessionList = await getSubdirectories(sidPath);
    const unzipedNoList: number[] = await getSessionNoList(unzipedSessionList);
    const converted: number[] = setSessionNo(unzipedNoList);
    
    const unzipedSessionData: DataEntry = {
        studentID: sid,
        session: converted,
    }

    unzipedDataList.push(unzipedSessionData);
    return unzipedDataList;
}


async function main() {
    const SOURCE_STRAGE: string = 'G:'
    const sourcePath = path.join(SOURCE_STRAGE);
    const info = await getUnzipedSessionList('70110043', sourcePath);
    console.log(info);
}

if (typeof require !== "undefined" && require.main === module) {
    main();
  }
  