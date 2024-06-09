import * as path from 'path';

// Mac, Winに関わらず拡張機能でパスにスラッシュ"/"を使ってるみたい
export function isProductCode(filePath: String): boolean {
    // return path.includes("\\src\\main\\")
    return filePath.includes("/src/main/")
}

export function isTestCode(filePath: String): boolean {
    // return path.includes("\\src\\test\\")
    return filePath.includes("/src/test/")
}

export async function getFileNameFromDotPath(dotPath:String):Promise<String> {
    const fileExpMatchArray: RegExpMatchArray | null = dotPath.match(/[^\.]+$/)
    let fileName = ""
    if (fileExpMatchArray != null) {
        fileName = fileExpMatchArray[0].toString()
    }
    return fileName
}

export async function getFileNameFromFilePath(filePath:String):Promise<String> {
    const fileExpMatchArray: RegExpMatchArray | null = filePath.match(/[^/]+$/)
    let fileName = ""
    if (fileExpMatchArray != null) {
        fileName = fileExpMatchArray[0].toString()
    }
    return fileName
}

export async function convertDateFromDirectoryName(datetime: String): Promise<Date> {
    datetime = datetime.replace("_", " ").replace(/\./g, ":")
    const d = new Date(datetime.toString())
    return d
}
