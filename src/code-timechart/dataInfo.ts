// Get data info for analyzeLog.ts
// 
import * as fs from 'fs-extra';
import * as path from 'path';
import { KokokonoLabsLogFormatter } from "./constants";

// 展開したログデータがある場所
const STRAGE_PATH: string = 'G:'; // Win
// const STRAGE_NAME: string = path.join(KokokonoLabsLogFormatter.VOLUMES, 'exB-??'); // Mac

interface dataList {
    session: string;
    path: string;
    runResultsType: string;
}

interface dataEntry {
    sid: string;
    dataList: dataList[];
}

export interface targetData {
    data: dataEntry[];
}

async function isFileExists(filePath: string): Promise<boolean> {
    try {
        fs.accessSync(filePath);
        return true;
    } catch (error) {
        return false;
    }
}

function isSomeExistsUnderPath(sourcePath: string): boolean {
    try {
        const stats = fs.statSync(sourcePath);
        if (stats.isDirectory()) {
            const entries = fs.readdirSync(sourcePath);
            return entries.length > 0;
        }
        return stats.isFile() || stats.isDirectory();
    } catch (error) {
        console.log(`not exist Under ${sourcePath}`);
        return false;
    }
}

/**
 * 指定されたパスの下に存在するディレクトリ名を取得する関数.
 * @param {string} parentDirectory - 対象ディレクトリのパス。
 * @returns {string[]} - ディレクトリ名のリスト。
 */
async function getSubdirectories(parentDirectory: string): Promise<string[]> {
    try {
        const entries = await fs.readdir(parentDirectory, { withFileTypes: true });
        const subdirectories = entries
            .filter(entry => entry.isDirectory())
            .map(entry => entry.name);
        return subdirectories;
    } catch (error: any) {
        console.log(`Error: getSubdirectories(): ${error.message}`);
        return [];
    }
}

/**
 * フォルダ名から実験番号を抽出する
 * @param (string} file - 対象の実験フォルダまでのパス
 * @returns {string} - 実験番号 -> 1~14 | No match -> 99
 */
function getExpNo(folder: string): number {
    const patterns = [
        /miniCV(\d{2})forStudent\d{4}/,
        /cv(\d{2})/,
        /CV(\d{2})/,
        /minicv(\d{2})/,
        /miniCV(\d{2})/,
        /cv(\d{2})-.*-log-\d{4}.\d{2}.\d{2}/,
        /\d{8}-.*cv(\d{2})/,
        /cv(\d{2})-kokokonolabs-log/,
    ];
    for (let pattern of patterns) {
        const match = folder.match(pattern);
        if (match) {
            const matchedNumber: number = Number(match[1]);
            return matchedNumber;
        }
    }
    // if dont exist project folder
    return 99;
}

async function isLogCorrectiveExist(logPath: string) {
    try {
        let bool = false
        if (await isFileExists(logPath)) {
            const editBool = isSomeExistsUnderPath(path.join(logPath, KokokonoLabsLogFormatter.EDIT_LOG_DIR));
            const testBool = isSomeExistsUnderPath(path.join(logPath, KokokonoLabsLogFormatter.TEST_LOG_DIR));
            const runBool = isSomeExistsUnderPath(path.join(logPath, KokokonoLabsLogFormatter.DEBUG_SESSION_DIR));
            const wsBool = isSomeExistsUnderPath(path.join(logPath, KokokonoLabsLogFormatter.WORKSPACE_HISTORY_DIR));

            bool = editBool && testBool && runBool && wsBool;
        } else {
            console.error(`isLogCorrectiveExist: Some log file is missing. ${logPath}`);
        }
        return bool
    } catch (error: any) {
        console.error(`Error: isLogCorrectiveExist: ${error.message}`);
        return false;
    }
}

export async function getDataInfo(studentListNo: string): Promise<targetData> {
    const studentIDList: string[] = [studentListNo]; // for one student ID

    // Json Propaty List Memo
    // {
    //      "data": [
    //      {
    //          "sid": "studentID"
    //          "dataList": [{
    //              "session": "sessionName"
    //              "path": "logPath"
    //              "runResultsType": "debug-sessions"
    //          },{},{}..]
    //      },{}..
    //      ]
    // }

    const targetData: targetData = {
        data: []
    };
    for (const studentID of studentIDList) {
        let isSessionExist: boolean = false;
        const studentIDPath: string = path.join(STRAGE_PATH, KokokonoLabsLogFormatter.UNZIPS, studentID);
        const sessionList: string[] = await getSubdirectories(studentIDPath);
        let dataList: dataList[] = [];
        for (const session of sessionList) {
            const sessionNo: number = getExpNo(session);
            if (sessionNo === 99) {
                continue;
            }
            const sessionName: string = ('cv' + ('00' + sessionNo).slice(-2));
            const logPath: string = path.join(studentIDPath, session, KokokonoLabsLogFormatter.BASE_FORMAT_DIR);
            // ここでログフォルダの存在を確認する
            if (await isLogCorrectiveExist(logPath)) {
                const sessionData: dataList = {
                    session: sessionName,
                    path: logPath,
                    runResultsType: KokokonoLabsLogFormatter.DEBUG_SESSION_DIR
                };
                dataList.push(sessionData);
                isSessionExist = true;
            }
        }
        if (isSessionExist === true) {
            const newData = {
                sid: studentID,
                dataList: dataList
            }
            targetData.data.push(newData);
            console.log(newData);
        }
    }
    return targetData;
}

async function main() {
    const args: string[] = process.argv.slice(2);
    const targetData: targetData = await getDataInfo(args[0]);
    console.log(targetData.data.length);
}
main()