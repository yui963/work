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
const AreaList: string[] = ["中部", "東部", "西部", "伊豆"];
let location: string = "";
const area_code: number = 220000;

export function activate(context: vscode.ExtensionContext) {
  const jump = vscode.commands.registerCommand("vscode-weather.jump", () => {
    vscode.env.openExternal(
      vscode.Uri.parse(
        "https://www.jma.go.jp/bosai/forecast/#area_type=offices&area_code=" +
          area_code
      )
    );
    context.subscriptions.push(jump);
  });
  const change = vscode.commands.registerCommand(
    "vscode-weather.change",
    async () => {
      location =
        (await vscode.window.showInputBox({
          title: "場所を設定してください(中部・西部・東部・伊豆)",
        })) || "";
      console.log(location);
      if (location === "" || !AreaList.includes(location)) {
        vscode.window.showInformationMessage(
          "設定された項目は対象外です。再設定をしてください。"
        );
        setChangeCommand(button);
        context.workspaceState.update("weatherLocation", "");
      } else {
        context.workspaceState.update("weatherLocation", location);
        searchWeather()
          .then((result) => {
            setJumpCommand(button, result);
          })
          .catch((error) => console.error(error));
      }
    }
  );
  context.subscriptions.push(change);

  const button = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    10
  );
  const savedPosition = context.workspaceState.get("weatherLocation", "");
  if (!savedPosition) {
    setChangeCommand(button);
  } else {
    location = savedPosition;
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
            weatherList.forEach((weather) => {
              console.log(weather);
              if (weather.includes("雨")) {
                resolve(location + "：近日雨");
              } else {
                resolve(location + "：近日晴れ");
              }
            });
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
