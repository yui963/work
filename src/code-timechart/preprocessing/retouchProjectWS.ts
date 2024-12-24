// ワークスペースの保存方法ミスってる（一階層上で保存してる）ログのフォーマッター
// (想定) フォーマットしたけど，ワークスペース保存のされ方が階層上でやり直すカーって時

import { join } from 'path';
import * as fs from 'fs-extra';
import { getSubdirectories } from './common';

const sourcePath: string = 'G:\\unzips\\70110092\\miniCV01forStudent2023\\kokokonolabs-log\\ws-history';

const timeList: string[] = await getSubdirectories(sourcePath);

// $time/workspace/~cv01/WS ↓
// $time/workspace/WS
// or 
// $time/WS?
// IF after format, 書き直して下さい
// $time/~cv01/WS ↓
// $time/WS

async function hoge(timeList: string[]) {
    for (const time of timeList) {
        const workPath: string = join(sourcePath, time, 'workspace');
        const underWorkspaceList: string[] = await getSubdirectories(workPath);
        for (const temp of underWorkspaceList) {
            const tempPath: string = join(workPath, temp); // $time/workspace/~cv01/
            const tempList: string[] = await getSubdirectories(tempPath); // $time/workspace/~cv01/WSs
            for (const ws of tempList) {
                const wsPath: string = join(tempPath, ws); // $time/workspace/~cv01/WS

            }
        }
    }
}