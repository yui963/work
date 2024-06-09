import * as fs from 'fs-extra';
import path from 'path';

export interface indicatorsInfo {
    id: String,
    session: String,
    indicators: any
}

// Basic Configurations
const sessionNameList = ["cv01", "cv02", "cv03", "cv04", "cv05", "cv06", "cv07", "cv08", "cv09", "cv10", "cv11", "cv12", "cv13", "cv14"]
// const outputFilePathBase = "./output/csv/"
const outputFilePathBase = path.join(process.cwd(), "output", "csv");

/**
 * Output All Indicators to "AllIndicators.csv"
 * @param resultIndicators 
 */
export async function outputAllIndicators(resultIndicators: any) {
    const keyList = getIndicatorKeyList(resultIndicators)
    const outputFilePath = path.join(outputFilePathBase, `AllIndicators.csv`)

    let heading = "id"
    for (const sessionName of sessionNameList) {
        for ( const key of keyList ) {
            const keyColumnName = key.replace(/\|/g, "-")
            heading += "," + sessionName + "#" + keyColumnName
        }
    }
    fs.ensureFileSync(outputFilePath)
    fs.writeFileSync(outputFilePath, heading + "\n", { flag: 'w' })

    const x: any = {}
    for (const id of Object.keys(resultIndicators)) {
        fs.writeFileSync(outputFilePath, id, { flag: 'a' })
        for (const session of sessionNameList) {
            if (session in resultIndicators[id]) {
                const indicators = resultIndicators[id][session]
                for ( const key of keyList ) {
                    const v = indicators.indicators[key]
                    fs.writeFileSync(outputFilePath, "," + v, { flag: 'a' })
                }
            }
            else {
                for ( const _ of keyList ) {
                    fs.writeFileSync(outputFilePath, ",", { flag: 'a' })
                }
            }
        }
        fs.writeFileSync(outputFilePath, "\n", { flag: 'a' })
    }
}

/**
 * Output Indicators by file name of Indicator Type like 
 * @param resultIndicators 
 */
export async function outputIndicatorsByIndicatorType(resultIndicators: any) {
    const keyList = getIndicatorKeyList(resultIndicators)
    for (const key of keyList) {
        const keyPath = key.replace(/\|/g, "-")
        // const outputFilePath = outputFilePathBase + keyPath + ".csv"
        const outputFilePath = path.join(outputFilePathBase, `${keyPath}.csv`)
        outputIndicatorsPersonRowSessionCol(resultIndicators, outputFilePath, key)
    }
}

async function outputIndicatorsPersonRowSessionCol(resultIndicators: any, outputFilePath: string, indicatorKey: string) {
    let heading = "id"
    for (const sessionName of sessionNameList) {
        heading += "," + sessionName
    }
    fs.ensureFileSync(outputFilePath)
    fs.writeFileSync(outputFilePath, heading + "\n", { flag: 'w' })

    const x: any = {}
    for (const id of Object.keys(resultIndicators)) {
        fs.writeFileSync(outputFilePath, id, { flag: 'a' })
        for (const session of sessionNameList) {
            if (session in resultIndicators[id]) {
                const indicators = resultIndicators[id][session]
                // console.log(indicators)
                const v = indicators.indicators[indicatorKey]
                fs.writeFileSync(outputFilePath, "," + v, { flag: 'a' })
            }
            else {
                fs.writeFileSync(outputFilePath, ",", { flag: 'a' })
            }
        }
        fs.writeFileSync(outputFilePath, "\n", { flag: 'a' })
    }
}

/**
 * Get all keys for indicators (e.g., 'I|UNTESTED_TIME_AFTER_EDIT|COUNT')
 * 
 * @param resultIndicators 
 * @returns 
 */
function getIndicatorKeyList(resultIndicators: any): string[] {
    try {
        const k1 = Object.keys(resultIndicators)[0]
        const k2 = Object.keys(resultIndicators[k1])[0]
        return Object.keys(resultIndicators[k1][k2].indicators)
    } catch (e: any) {
        console.log("Error: resultIndicators does not have any key: " + e)
        return []
    }
}
