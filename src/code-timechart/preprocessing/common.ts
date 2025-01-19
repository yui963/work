import * as fs from "fs-extra";
import * as path from "path";

export async function isFileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * 指定されたディレクトリの下に存在するディレクトリ名のみを取得する関数.
 * @param {string} parentDirectory - 対象ディレクトリのパス。
 * @returns {string[]} - ディレクトリ名のリスト。
 */
export async function getSubdirectories(
  parentDirectory: string
): Promise<string[]> {
  try {
    const entries = await fs.readdir(parentDirectory, { withFileTypes: true });
    const subdirectories = entries
      .filter((entry) => entry.isDirectory())
      .filter((entry) => !entry.name.startsWith("._"))
      .map((entry) => entry.name);
    return subdirectories;
  } catch (error: any) {
    console.log(`Error: getSubdirectories(): ${error.message}`);
    return [];
  }
}

/**
 * 指定されたディレクトリの下に存在すファイル名のみを取得する関数.
 * @param {string} parentDirectory - 対象ディレクトリのパス。
 * @returns {string[]} - ディレクトリ名のリスト。
 */
export async function getSubFiles(parentDirectory: string): Promise<string[]> {
  try {
    const entries = await fs.readdir(parentDirectory, { withFileTypes: true });
    const subdirectories = entries
      .filter((entory) => entory.isFile())
      .filter((entry) => !entry.name.startsWith("._"))
      .map((entry) => entry.name);
    return subdirectories;
  } catch (error: any) {
    console.log(`Error: getSubFiles(): ${error.message}`);
    return [];
  }
}

/**
 * 指定されたディレクトリの下に存在するディレクトリ名・ファイル名を取得する関数.
 * @param {string} parentDirectory - 対象ディレクトリのパス。
 * @returns {string[]} - ディレクトリ名のリスト。
 */
export async function getSubEntries(
  parentDirectory: string
): Promise<string[]> {
  try {
    const entries = await fs.readdir(parentDirectory, { withFileTypes: true });
    const subdirectories = entries
      .filter((entry) => !entry.name.startsWith("._"))
      .map((entry) => entry.name);
    return subdirectories;
  } catch (error: any) {
    console.log(`Error: getSubEntries(): ${error.message}`);
    return [];
  }
}

/**
 * 指定されたディレクトリの下に存在するZipファイル名を取得する関数.
 * @param {string} parentDirectory - 対象ディレクトリのパス。
 * @returns {string[]} - ディレクトリ名のリスト。
 */
export async function getSubZipFiles(
  parentDirectory: string
): Promise<string[]> {
  try {
    const entries = await fs.readdir(parentDirectory, { withFileTypes: true });
    const subdirectories = entries
      .filter((entry) => !entry.name.startsWith("._"))
      .filter((entry) => entry.name.endsWith(".zip"))
      .map((entry) => entry.name);
    return subdirectories;
  } catch (error: any) {
    console.log(`Error: getSubZipFiles(): ${error.message}`);
    return [];
  }
}

export async function getZipFiles(parentDirectory: string): Promise<string[]> {
  try {
    const entries = await fs.readdir(parentDirectory, { withFileTypes: true });
    const zipFiles = entries
      .filter((entry) => entry.isFile())
      .filter((entry) => entry.name.endsWith(".zip"))
      .map((entry) => entry.name.replace(/\.zip$/, ""));
    return zipFiles;
  } catch (error: any) {
    console.log(`Error: getZipFiles(): ${error.message}`);
    return [];
  }
}
