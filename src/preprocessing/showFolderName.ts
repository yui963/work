// cv02とかが2連続になってる可能性もあるから一個下まで見たほうがいい！！改良！！

import * as path from 'path';
import * as fs from 'fs-extra';

import { getSubEntries, getSubdirectories } from './common';
import { KokokonoLabsLogFormatter } from './constants';

const STRAGE_NAME: string = 'G:';

interface Entry {
    sessionName: string;
    dataList: string[];
}

interface dataEntry {
    sid: string;
    sessionList: Entry[];
}

interface targetData {
    data: dataEntry[];
}

// sessionの下にsrcフォルダが存在するか(提出形式が正しいか)確認
function check(target: targetData) {
    for (const data of target.data) {
        for (const session of data.sessionList) {
            if (session.sessionName.startsWith('__')) continue;
            let bool: boolean = false;
            for (const source of session.dataList) {
                if (source === "src") bool = true;
            }
            if (bool === false) {
                console.error(`Not exist src/:${session.sessionName} of ${data.sid}`);
            }
        }
    }
}

async function main() {
    const targetData: targetData = {
        data: []
    };
    // '/Volumes/exB-**/unzips/'
    // const basePath: string = path.join(KokokonoLabsLogFormatter.VOLUMES, STRAGE_NAME, KokokonoLabsLogFormatter.UNZIPS);
    const basePath: string = path.join(STRAGE_NAME, KokokonoLabsLogFormatter.UNZIPS);
    const sidList: string[] = await getSubdirectories(basePath);
    for (const sid of sidList) {
        const sidPath: string = path.join(basePath, sid);
        const sessionList: string[] = await getSubdirectories(sidPath);
        const newDataEntry: dataEntry = {
            sid: "",
            sessionList: []
        }
        newDataEntry.sid = sid;
        for (const session of sessionList) {
            const sessionPath: string = path.join(sidPath, session);
            const dataList: string[] = await getSubEntries(sessionPath);
            const newEntry: Entry = {
                sessionName: session,
                dataList: dataList
            };
            newDataEntry.sessionList.push(newEntry);
        }
        targetData.data.push(newDataEntry);
        // console.log(newEntry);
    }
    check(targetData);
    return targetData;
}

main().then((targetData) => {
    const jsonString = JSON.stringify(targetData, null, 2); // 2はスペースの数
    const filePath = 'output/showFolderName.json';
    fs.writeFileSync(filePath, jsonString, 'utf-8');
});