import pandas as pd


def filterCSVNullsAndZero():
    csvFilePath = "./output/csv/MAXInterval.csv"
    df = pd.read_csv(csvFilePath, header=0)

    df.drop(df.columns[8:], axis=1, inplace=True)
    df.dropna(inplace=True)
    print(df)


filterCSVNullsAndZero()
