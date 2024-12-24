// Formatter Learner's kokokonolabs-log Folder [Ver.01]
// 2023.11 改良後拡張機能のログファイルフォーマッター
// 事前にセッション単位でのunzipはしておく
//
// Written by Yasuhiro Mashiyama
// 2023.12.13

import * as fs from 'fs-extra';
import AdmZip from 'adm-zip';
import { join } from 'path';

import { KokokonoLabsLogFormatter } from './constants';
import { getSubZipFiles, getSubdirectories } from './common';

// ストレージと対象学籍番号をリストしたテキストファイルを指定
const DEST_STRAGE: string = 'G:';
const FOLDERS_NAME: string = KokokonoLabsLogFormatter.FOLDERS + 'All' + '.txt';
// 提出パス
// const drivePath: string = join(KokokonoLabsLogFormatter.VOLUMES, STRAGE); // Mac
const drivePath: string = join(DEST_STRAGE); // Win


async function isFileExists(filePath: string): Promise<boolean> {
	try {
		await fs.access(filePath);
		return true;
	} catch (error) {
		return false;
	}
}

/**
 * 指定されたディレクトリ内のログファイルを指定されたフォーマットに変換し，新しいディレクトリにコピーする関数．
 * @param {string} inputDir - ログファイルが存在するディレクトリパス
 * @param {string} outputDir - フォーマット後のログファイルを保存するディレクトリパス
 * @param {string} type - フォーマット対象のログの種類
 * @returns {void} - 処理の成否に依らず何も返さない
 */
async function formatTxtFileName(inputDir: string, outputDir: string, type: string): Promise<void> {
	try {
		const timeList: string[] = await fs.readdir(inputDir, 'utf-8');
		timeList.forEach((time: string) => {
			const timePath: string = join(inputDir, time);
			if (fs.statSync(timePath).isDirectory()) {
				const textPath: string = join(timePath, type);
				const newFileName: string = time + '.txt';
				const newFilePath: string = join(outputDir, newFileName);
				fs.copyFileSync(textPath, newFilePath);
			}
		})
	} catch (err) {
		console.log('Error: formatTxtFileName():', err);
	}
}


/**
 * 指定されたディレクトリの下にそのままの名前でzip解凍する関数.
 * @param zipFilePath - 対象のzipファイルパス
 * @param extractTo - 解凍先のディレクトリパス
 */
async function unzipFile(zipFilePath: string, extractTo: string): Promise<void> {
	try {
		const zip = new AdmZip(zipFilePath);
		await fs.ensureDir(extractTo);
		zip.extractAllTo(extractTo, true);
	} catch (error: any) {
		console.log('Error: unzipFile():', error.message);
	}
}

async function copyDir(sourceDir: string, destinationDir: string): Promise<void> {
	try {
		await fs.copy(sourceDir, destinationDir);
	} catch (error: any) {
		console.log(`Error: copyDir(): ${error.message}`);
	}
}

async function deleteZipFile(sourcePath: string, zipFileList: string[]): Promise<void> {
	for (const zipFile of zipFileList) {
		if (!zipFile.endsWith('.zip')) {
			continue;
		}
		const zipPath: string = join(sourcePath, zipFile);
		try {
			if (await isFileExists(zipPath)) {
				await fs.remove(zipPath);
				console.log(`Delete Zip: '${zipPath}' successfully deleted.`);
			}
		} catch (error: any) {
			console.error(`Error: deleteZipFile(): '${zipPath}': ${error.message}`);
		}
	}
}

/**
 * ディレクトリ全体をコピーする関数。- edit-activity workspace
 * @param {string} sourceDir - コピー元のディレクトリパス。
 * @param {string} destinationDir - コピー先のディレクトリパス。
 */
async function copyDirIfNotExist(sourceDir: string, destinationDir: string): Promise<void> {
	const isDirExist = await isFileExists(destinationDir);
	if (isDirExist) {
		// console.log(`${destinationDir} is already Exist.`); // test,runが重複する
		return;
	}
	try {
		// zipがない場合問答無用でERROR吐くので改善
		const sessionFileList: string[] = await getSubZipFiles(sourceDir);
		await deleteZipFile(sourceDir, sessionFileList);
		await fs.copy(sourceDir, destinationDir);
	} catch (error: any) {
		console.error(`Error: copyDirIfNotExist(): ${error.message}`);
	}
}

/**
 * 指定されたDir内の$timestamp.zipと$timestamp/workspaceを ws-history に解凍/コピーする関数.
 * @param {string} sourceDir - コピー元の zipファイルを持つ ディレクトリパス
 * @param {string} destinationDir - 解凍・コピー先の ws-hisotry ディレクトリパス
 * @param {string} timestampList - コピー元のタイムスタンプのリスト
 */
async function unzipFileOrCopyDirOnList(sourceDir: string, destinationDir: string, timestampList: string[]): Promise<void> {
	try {
		for (const timestamp of timestampList) {
			const sourceZipDirPath: string = join(sourceDir, `${timestamp}.zip`);
			const destinationTimeDirPath: string = join(destinationDir, timestamp);
			if (await isFileExists(sourceZipDirPath)) {
				unzipFile(sourceZipDirPath, destinationTimeDirPath);
			} else {
				const sourceTimeDirPath: string = join(sourceDir, timestamp, 'workspace');
				await copyDirIfNotExist(sourceTimeDirPath, destinationTimeDirPath);
			}
		}
	} catch (error: any) {
		console.error(`Error: unzipFileOnList(): ${error.message}`);
	}
}

/**
 * ログフォーマットを一つのプロジェクトファイルに対して行う
 * @param inputBasePath - BASE/$studentID/$miniCV/kokokonolabs-log/
 * @param outputBasePath - BASE/$studentID/$miniCV/kokokonolabs-log-fv01/
 */
async function formatOneProject(inputBasePath: string, outputBasePath: string): Promise<void> {
	// 入力パス
	const runResultsInPath: string = join(inputBasePath, KokokonoLabsLogFormatter.RUN_LOG_DIR);
	const testResultsInPath: string = join(inputBasePath, KokokonoLabsLogFormatter.TEST_LOG_DIR);
	const editActivityInPath: string = join(inputBasePath, KokokonoLabsLogFormatter.EDIT_LOG_DIR);
	const wsHistoryInPath: string = join(inputBasePath, KokokonoLabsLogFormatter.WORKSPACE_HISTORY_DIR);
	// 出力パス
	const debugSessionsOutPath: string = join(outputBasePath, KokokonoLabsLogFormatter.DEBUG_SESSION_DIR);
	const testResultsOutPath: string = join(outputBasePath, KokokonoLabsLogFormatter.TEST_LOG_DIR);
	const editActivityOutPath: string = join(outputBasePath, KokokonoLabsLogFormatter.EDIT_LOG_DIR);
	const wsHistoryOutPath: string = join(outputBasePath, KokokonoLabsLogFormatter.WORKSPACE_HISTORY_DIR);

	// run-results からdebugSession.txtを fv01.debug-sessions にコピー
	const typeDebug: string = 'debugSession.txt';
	await fs.ensureDir(debugSessionsOutPath);
	await formatTxtFileName(runResultsInPath, debugSessionsOutPath, typeDebug);
	// runResultsLogger.txt, debugLogger.txt をコピー
	try {
		await fs.copyFile(join(runResultsInPath, 'runResultsLogger.txt'),
			join(outputBasePath, 'runResultsLogger.txt'));
	} catch (error: any) {
		console.error(`Error: copyFile(runResultsLogger.txt): ${error.message}`);
	}
	try {
		await fs.copyFile(join(runResultsInPath, 'debugLogger.txt'),
			join(outputBasePath, 'debugLogger.txt'));
	} catch (error: any) {
		console.error(`Error: copyFile(debugLogger.txt): ${error.message}`);
	}

	// test-results からtest-results.txtを fv01.test-results にコピー
	const typeTest: string = 'test-results.txt';
	await fs.ensureDir(testResultsOutPath);
	await formatTxtFileName(testResultsInPath, testResultsOutPath, typeTest);

	// edit-activity から{timestamp}.000を fv01.edit-activity にコピー
	await fs.ensureDir(editActivityOutPath);
	await copyDir(editActivityInPath, editActivityOutPath);

	// ws-history から{timestamp}/に workspace/をコピー
	await fs.ensureDir(wsHistoryOutPath);
	await getSubdirectories(wsHistoryInPath).then(async (miniCV: string[]) => {
		const condition = (item: string) => item !== `.DS_Store`;
		const filteredData = miniCV.filter(condition);
		await unzipFileOrCopyDirOnList(wsHistoryInPath, wsHistoryOutPath, filteredData);
	});
	// await unzipFileOrCopyDirOnList(wsHistoryInPath, wsHistoryOutPath, wsHistoryTimestampList);

	// test-results, run-results から workspace をコピー
	await getSubdirectories(runResultsInPath).then(async (miniCV: string[]) => {
		const condition = (item: string) => item !== `.DS_Store`;
		const filteredData = miniCV.filter(condition);
		await unzipFileOrCopyDirOnList(runResultsInPath, wsHistoryOutPath, filteredData);
	});
	await getSubdirectories(testResultsInPath).then(async (miniCV: string[]) => {
		const condition = (item: string) => item !== `.DS_Store`;
		const filteredData = miniCV.filter(condition);
		await unzipFileOrCopyDirOnList(testResultsInPath, wsHistoryOutPath, filteredData);
	});
}

// 学籍番号, 課題ごとにfor文を回すだけ
async function formatAsync() {
	const unzipPath: string = join(drivePath, KokokonoLabsLogFormatter.UNZIPS);
	const foldersNamePath: string = join(drivePath, KokokonoLabsLogFormatter.FOLDERS, FOLDERS_NAME);
	// const studentIDList = fs.readFileSync(foldersNamePath, 'utf-8').split('\n'); // Mac
	let studentIDList = fs.readFileSync(foldersNamePath, 'utf-8').split('\r\n');
	if (studentIDList[0].length > 9) {
		studentIDList = fs.readFileSync(foldersNamePath, 'utf-8').split('\n').filter(Boolean);
	}
	for (const studentID of studentIDList) {
		const studentIDPath: string = join(unzipPath, studentID);
		await getSubdirectories(studentIDPath).then(async (miniCV: string[]) => {
			const condition = (item: string) => item !== `.DS_Store`;
			const filteredData = miniCV.filter(condition);
			for (const miniCV of filteredData) {
				const miniCVPath: string = join(studentIDPath, miniCV);
				const inputBasePath: string = join(miniCVPath, KokokonoLabsLogFormatter.BASE_DIR);
				const outputBasePath: string = join(miniCVPath, KokokonoLabsLogFormatter.BASE_FORMAT_DIR);
				if (await fs.pathExists(outputBasePath)) {
					console.log(`Skip: isExist ${outputBasePath}`);
					continue;
				}
				if (miniCV.startsWith('._')) {
					console.log(`Remove: startWith._: ${miniCV}`);
					fs.remove(miniCVPath);
				}
				else {
					await formatOneProject(inputBasePath, outputBasePath)
					// .then(() => {
					// 	fs.remove(inputBasePath, err => {
					// 		if (err) console.log(err.message);
					// 	});
					// });
				};
				console.log(`Format completed: ${miniCVPath}`);
			};
		});
	};
}

formatAsync();