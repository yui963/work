// Not src/, pom.xml にしたほうがいいかも
// 容量削減のためのtsなので旧ログフォーマットを削除できるようにしてる
import * as fs from 'fs-extra';
import { join }  from 'path';
import { KokokonoLabsLogFormatter } from './constants';
import { getSubdirectories, isFileExists } from './common';

const DEST_STRAGE: string = 'G:';

/*
// sourcePath = ~/$timeStamp
async function deleteZipFile(sourcePath: string): Promise<void> {
    const dotGitPath: string = join(sourcePath, `workspace`, `.git`);
    try {
        if (await isFileExists(dotGitPath)) {
            await fs.remove(dotGitPath);
            console.log(`Git '${dotGitPath}' successfully deleted.`);
        }
    } catch (error: any) {
        console.error(`!! !! Error deleting .git '${dotGitPath}': ${error.message}`);
    }
}*/

// sourcePath = ~/$timeStamp
async function deleteDotGit(sourcePath: string): Promise<void> {
    const dotGitPath: string = join(sourcePath, `workspace`, `.git`);
    try {
        if (await isFileExists(dotGitPath)) {
            await fs.remove(dotGitPath);
            console.log(`Delete Git '${dotGitPath}'`);
        }
    } catch (error: any) {
        console.error(`!! !! Error deleting .git '${dotGitPath}': ${error.message}`);
    }
}

// sourcePath = ~/$timeStamp;
async function deleteTergetDir(sourcePath: string): Promise<void> {
    const workspacePath: string = join(sourcePath, `workspace`, `target`);
    try {
        await fs.remove(workspacePath);
        console.log(`Delete Dir '${workspacePath}'`);
    } catch (error: any) {
        console.error(`!! !! Error deleting directory '${workspacePath}': ${error.message}`);
    }
}

// ディレクトリからエントリ取得も良いが，挙動が安定しない(ちょっと意味分からない)のでパス指定で．
async function deleteExFiles(sourcePath: string) {
    const timestampList: string[] = await getSubdirectories(sourcePath);
    for (const timestamp of timestampList) {
        const timestampPath: string = join(sourcePath, timestamp);
        await deleteTergetDir(timestampPath);
        await deleteDotGit(timestampPath);
    }
}

async function createPathToDelete(sourcePath: string): Promise<void> {
    const runPath: string = join(sourcePath, KokokonoLabsLogFormatter.RUN_LOG_DIR);
    const testPath: string = join(sourcePath, KokokonoLabsLogFormatter.TEST_LOG_DIR);
    const wsPath: string = join(sourcePath, KokokonoLabsLogFormatter.WORKSPACE_HISTORY_DIR);

    deleteExFiles(runPath);
    deleteExFiles(testPath);
    deleteExFiles(wsPath);
}

async function main() {
    // Mac input: /Volumes/exB-**/unzips/
    // const basePath: string = join(KokokonoLabsLogFormatter.VOLUMES, DEST_STRAGE, KokokonoLabsLogFormatter.UNZIPS);
    const basePath: string = join(DEST_STRAGE, KokokonoLabsLogFormatter.UNZIPS);
    const studentList: string[] = await getSubdirectories(basePath);
    for (const student of studentList) {
        const studentPath: string = join(basePath, student);
        const projList: string[] = await getSubdirectories(studentPath);
        for (const proj of projList) {
            const projPath: string = join(studentPath, proj);
            const logPath: string = join(projPath, KokokonoLabsLogFormatter.BASE_DIR);
            createPathToDelete(logPath);
        }
    }
}
main();