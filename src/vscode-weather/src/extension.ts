import * as vscode from "vscode";

interface Forecast {
  publishingOffice: string;
  reportDatetime: string;
  timeSeries: TimeSeries[];
}

interface TimeSeries {
  timeDefines: string[];
  areas: Area[];
}

interface Area {
  area: {
    name: string;
    code: string;
  };
  weatherCodes: string[];
  weathers: string[];
  winds: string[];
  waves: string[];
  pops: string[];
  temps: string[];
  tempsMin: string[];
  tempsMinUpper: string[];
  tempsMinLower: string[];
  tempsMax: string[];
  tempsMaxUpper: string[];
  tempsMaxLower: string[];
  reliabilities: string[];
}
interface DayObject {
  day: number;
  str: string;
}
interface AreaObject {
  name: string;
  code: string;
  area: string[];
}
const dayList: DayObject[] = [
  { day: 0, str: "今日" },
  { day: 1, str: "明日" },
  { day: 2, str: "明後日" },
];

const yamagata: string[] = ["村山", "置賜", "庄内", "最上"];
const shizuoka: string[] = ["中部", "東部", "西部", "伊豆"];
const PrefectureList: AreaObject[] = [
  { name: "山形", code: "060000", area: yamagata },
  { name: "静岡", code: "220000", area: shizuoka },
];
const quickPickItems = PrefectureList.map((prefecture) => ({
  label: prefecture.name,
}));
let location: string = "";
let area_code: string = "";
let prefecture: string = "";
export function activate(context: vscode.ExtensionContext) {
  const change = vscode.commands.registerCommand(
    "vscode-weather.change",
    async () => {
      await vscode.window
        .showQuickPick(quickPickItems, {
          placeHolder: "都道府県を選択してください",
        })
        .then((place) => {
          if (place !== undefined) {
            prefecture = place.label;
            context.workspaceState.update("prefecture", prefecture);
            PrefectureList.forEach((prefecture) => {
              if (prefecture.name === place.label) {
                area_code = prefecture.code;
                context.workspaceState.update("area_code", area_code);
                vscode.window
                  .showQuickPick(prefecture.area, {
                    placeHolder: "地域を選択してください",
                  })
                  .then((option) => {
                    if (option !== undefined) {
                      location = option;
                      console.log(location);
                      context.workspaceState.update(
                        "weatherLocation",
                        location
                      );
                      searchWeather()
                        .then((result) => {
                          setJumpCommand(button, result);
                        })
                        .catch((error) => console.error(error));
                    } else {
                      vscode.window.showInformationMessage("地域未選択");
                      location = "";
                      setChangeCommand(button);
                    }
                  });
              }
            });
          } else {
            vscode.window.showInformationMessage("都道府県未選択");
            area_code = "";
            setChangeCommand(button);
          }
        });
    }
  );
  context.subscriptions.push(change);
  const jump = vscode.commands.registerCommand("vscode-weather.jump", () => {
    vscode.env.openExternal(
      vscode.Uri.parse(
        "https://www.jma.go.jp/bosai/forecast/#area_type=offices&area_code=" +
          area_code
      )
    );
    context.subscriptions.push(jump);
  });
  const button = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    10
  );
  const savedLocation = context.workspaceState.get("weatherLocation", "");
  const savedArea_code = context.workspaceState.get("area_code", "");
  const savedPrefecture = context.workspaceState.get("prefecture", "");
  if (!savedLocation && !savedArea_code && !savedPrefecture) {
    setChangeCommand(button);
  } else {
    area_code = savedArea_code;
    location = savedLocation;
    prefecture = savedPrefecture;
    searchWeather()
      .then((result) => {
        setJumpCommand(button, result);
      })
      .catch((error) => console.error(error));
  }

  context.subscriptions.push(button);
  button.show();
}
function searchWeather(): Promise<string> {
  return new Promise((resolve, reject) => {
    const url =
      "https://www.jma.go.jp/bosai/forecast/data/forecast/" +
      area_code +
      ".json";
    fetch(url)
      .then(function (response: Response) {
        return response.json() as Promise<Forecast[]>;
      })
      .then(function (forecast: Forecast[]) {
        const areas = forecast[0].timeSeries[0].areas;
        areas.forEach((part) => {
          if (part.area.name === location) {
            const weatherList: string[] = part.weathers;
            weatherList.forEach((weather, index) => {
              console.log(weather);
              if (weather.includes("雨")) {
                resolve(
                  prefecture +
                    "（" +
                    location +
                    "）" +
                    "：" +
                    dayList[index].str +
                    "雨有り"
                );
              }
            });
            resolve(prefecture + "（" + location + "）" + "：晴れ");
          }
        });
      })
      .catch((error) => {
        console.error(error);
        reject(error);
      });
  });
}
function setChangeCommand(button: vscode.StatusBarItem) {
  button.text = "未設定";
  button.tooltip = "クリックで場所を設定";
  button.command = "vscode-weather.change";
}
function setJumpCommand(button: vscode.StatusBarItem, result: string) {
  button.text = result;
  button.tooltip = "クリックでサイトを表示します";
  button.command = "vscode-weather.jump";
  button.color = new vscode.ThemeColor("statusBarItem.prominentForeground");
}
export function deactivate() {}
