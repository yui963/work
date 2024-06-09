import pandas as pd
import matplotlib.pyplot as plt


def filterCSVNullsAndZero():
    csvFilePath = "./output/csv/MAXInterval.csv"
    df = pd.read_csv(csvFilePath, header=0)
    df.drop(df.columns[8:], axis=1, inplace=True)
    df.dropna(inplace=True)
    return df


def selectColumns(num):
    df = filterCSVNullsAndZero()
    sid = "cv" + num
    selected_columns = df[["id", sid]]
    print(selected_columns)
    return selected_columns


def createDataArray(df, sid):
    data_array = df[sid].values
    return data_array


def createHistogram(num):
    df = filterCSVNullsAndZero()
    sid = "cv" + num
    data = createDataArray(df, sid)
    plt.hist(data, bins=10, edgecolor="black")
    plt.xlabel("time(ms*10^9)")
    plt.ylabel("Frequency")
    plt.title("Maximum intervals that pass the new test")
    plt.grid(True)
    plt.show()


createHistogram("01")
