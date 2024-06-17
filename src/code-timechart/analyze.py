import pandas as pd
import matplotlib.pyplot as plt
import json
from datetime import datetime
import numpy as np

# def filterCSVNullsAndZero():
#     csvFilePath = "./output/csv/MAXInterval.csv"
#     df = pd.read_csv(csvFilePath, header=0)
#     df.drop(df.columns[8:], axis=1, inplace=True)
#     df.dropna(inplace=True)
#     return df


# def selectColumns(df, num):
#     sid = "cv" + num
#     selected_columns = df[["id", sid]]
#     print(selected_columns)
#     return selected_columns


# def createDataArray(df, sid):
#     data_array = df[sid].values
#     return data_array


# def createHistogram(num):
#     df = filterCSVNullsAndZero()
#     sid = "cv" + num
#     data = createDataArray(df, sid)
#     plt.hist(data, bins=10, edgecolor="black")
#     plt.xlabel("time(ms*10^9)")
#     plt.ylabel("Frequency")
#     plt.title("Maximum intervals that pass the new test")
#     plt.grid(True)
#     plt.show()


def readTestRunJson(jsonFilePath, id, session):
    with open(jsonFilePath, "r") as f:
        data_list = json.load(f)
    select_id = id
    select_session = session
    for data in data_list:
        if data["id"] == select_id and data["session"] == select_session:
            dates = data["invokedDates"]
    return getUnixTimestamps(dates)


def readResumedDateJson(jsonFilePath, id, session):
    dates = []
    with open(jsonFilePath, "r") as f:
        data_list = json.load(f)
    select_id = id
    select_session = session
    for data in data_list:
        if data["id"] == select_id and data["session"] == select_session:
            dates.append(
                [
                    getUnixTimestamp(data["endDate"]),
                    getUnixTimestamp(data["restartDate"]),
                ]
            )
    return dates


def getUnixTimestamps(dates):
    timestamps = []
    for date in dates:
        dt = datetime.fromisoformat(date.replace("Z", "+00:00"))
        unix_timestamp = dt.timestamp()
        timestamps.append(int(unix_timestamp))
    return timestamps


def getUnixTimestamp(date):
    dt = datetime.fromisoformat(date.replace("Z", "+00:00"))
    unix_timestamp = dt.timestamp()
    timestamp = int(unix_timestamp)
    return timestamp


def readStartDate(id, session):
    csvFilePath = "./output/csv/startDate.csv"
    df = pd.read_csv(csvFilePath)
    row = df[["id", session]]
    value = row.loc[0, session]
    return getUnixTimestamp(value)


# if next date is over end date
# dec += (restart date - end date)
# date -= dec
# [rd1,ed1],[rd2,ed2] index++
def removeBlankPeriods(testRunDate, resumedDate, idx):
    removedList = []
    index = idx
    blankPeriods = 0
    for runDate in testRunDate:
        while index < len(resumedDate) and int(runDate) > int(resumedDate[index][1]):
            blankPeriods += int(resumedDate[index][1]) - int(resumedDate[index][0])
            index += 1
        removedList.append(runDate - blankPeriods)
    return removedList


def removeBlankStartAndRun(startDate, testRunDates, resumedDate):
    index = 0
    blank = 0
    while testRunDates[0] > resumedDate[index][1]:
        blank += int(resumedDate[index][1]) - int(resumedDate[index][0])
        index += 1
    plusStartDate = startDate + blank
    return index, plusStartDate


# def decStartDate(dataList, startDate):
#     decList = [int(item) - startDate for item in dataList]
#     return decList


# def plusStartDate(dataList, startDate):
#     plusList = [int(item) + startDate for item in dataList]
#     return plusList


# def decStartDates(dataLists, startDate):
#     decList = [[int(item) - startDate for item in sublist] for sublist in dataLists]

#     return decList


# 開始時刻からテスト実行までに隙間時間がある場合も考慮しないといけない
# 開始時刻をテスト実行側に寄せる
# startTime += restartDate - endDate
# runDateから空白を消すよりも前に処理をしてindexを更新する必要がある
# cv04の場合、全体の時間は11時間らしい
# これからコードリーディングの時間を取り除く必要がある
def main():
    sid = "cv04"
    id = "70110094"
    invokedDates = readTestRunJson("./output/test-run/testRunInfoList.json", id, sid)
    startDate = readStartDate(id, sid)
    resumedDates = readResumedDateJson(
        "./output/test-run/resumedDateList.json", id, sid
    )
    index, plusStartDate = removeBlankStartAndRun(startDate, invokedDates, resumedDates)
    removedList = removeBlankPeriods(invokedDates, resumedDates, index)
    width = int((removedList[-1] - plusStartDate) / 10)
    print(startDate)
    print(plusStartDate)
    print(removedList[-1])
    # ヒストグラムを作成する
    plt.figure(figsize=(10, 6))
    plt.hist(
        removedList,
        bins=np.arange(plusStartDate, removedList[-1], width),
        edgecolor="black",
        alpha=0.7,
    )
    plt.xlabel("Unix Epoch Time")
    plt.ylabel("counts")
    plt.title("Test execution cyclicity (70110094)")
    plt.grid(True)
    plt.xticks(np.arange(plusStartDate, removedList[-1], width))
    plt.tight_layout()
    plt.show()


if __name__ == "__main__":
    main()
