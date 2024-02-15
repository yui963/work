import { Box, Typography } from "@mui/material";

const Weather = () => {
  return (
    <>
      <Box marginLeft={2} marginRight={2}>
        <Box sx={{ marginTop: "70px" }}>
          <Typography
            className="context"
            variant="h4"
            align="left"
            sx={{ fontFamily: "Noto Serif JP, serif" }}
          >
            vscode拡張機能（天気予報取得）
          </Typography>
        </Box>
        <Box sx={{ marginTop: "40px" }}>
          <img width="80%" height="auto" src="./img/extension_view.png" />
        </Box>
        <Box sx={{ marginTop: "40px" }}>
          <Typography
            className="context"
            variant="h6"
            align="left"
            sx={{ fontFamily: "Noto Serif JP, serif" }}
          >
            地域を選択することで直近３日間の天気を取得、雨の日を教えてくれます。
          </Typography>
          <div
            style={{ display: "flex", flexDirection: "row", marginTop: "20px" }}
          >
            <img src="./img/github_icon.png" width="3%" height="3%" />
            <Typography
              className="context"
              component="a"
              variant="body1"
              href="https://github.com/yui963/work/tree/main/src/vscode-weather"
              sx={{ fontFamily: "Noto Serif JP, serif" }}
            >
              https://github.com/yui963/work/tree/main/src/vscode-weather
            </Typography>
          </div>
        </Box>
        <Box sx={{ marginTop: "100px" }}>
          <Typography
            className="context"
            variant="h6"
            align="left"
            sx={{ fontFamily: "Noto Serif JP, serif" }}
          >
            目的
          </Typography>
          <Box sx={{ marginTop: "10px" }}>
            <Typography
              className="context"
              variant="body2"
              align="left"
              sx={{ fontFamily: "Noto Serif JP, serif" }}
            >
              <ul className="list">
                <li>研究でvscode拡張機能を実装するかもしれないため触りたい</li>
                <li>プログラミング中に雨に気が付かないことがある</li>
              </ul>
            </Typography>
          </Box>
        </Box>
        <Box sx={{ marginTop: "100px" }}>
          <Typography
            className="context"
            variant="h6"
            align="left"
            sx={{ fontFamily: "Noto Serif JP, serif" }}
          ></Typography>
          <Box sx={{ marginTop: "10px" }}>
            <Typography
              className="context"
              variant="h6"
              align="left"
              sx={{ fontFamily: "Noto Serif JP, serif" }}
            >
              事前準備
              <Typography
                className="context"
                variant="body2"
                align="left"
                sx={{ fontFamily: "Noto Serif JP, serif" }}
              >
                Yeomanを用いてvscode拡張機能用テンプレートをインストールする。
              </Typography>
            </Typography>
            <Box />
            <Box sx={{ marginTop: "30px" }}>
              <Typography
                className="context"
                variant="h6"
                align="left"
                sx={{ fontFamily: "Noto Serif JP, serif" }}
              >
                天気予報取得部分
                <Typography
                  className="context"
                  variant="body2"
                  align="left"
                  sx={{ fontFamily: "Noto Serif JP, serif" }}
                >
                  気象庁の天気予報などのデータがjson形式で公開されている。
                  https://www.jma.go.jp/bosai/forecast/data/forecast/XXXXXX.jsonというURLで、XXXXXXには地域コードが入力される。
                  FetchAPIを用いて取得して解析することで、指定した地域の３日間の天気を確認することができる。
                  全国対応できるが、県ごとに地域の配列を用意することが非常に大変なので２県のみ実装した。
                </Typography>
                <Box sx={{ marginTop: "40px", textAlign: "center" }}>
                  <img width="60%" height="auto" src="./img/json_view.png" />
                </Box>
              </Typography>
            </Box>
            <Box sx={{ marginTop: "50px" }}>
              <Typography
                className="context"
                variant="h6"
                align="left"
                sx={{ fontFamily: "Noto Serif JP, serif" }}
              >
                vscode拡張機能部分
                <Typography
                  className="context"
                  variant="body2"
                  align="left"
                  sx={{ fontFamily: "Noto Serif JP, serif" }}
                >
                  地域を選択するコマンド・選択した地域の天気予報webサイトを開くコマンドの２つを開発する。
                  vscodeのウィンドウ右下に天気情報を表示するボタンを配置した。
                  初めの時点ではボタンに地域を選択するコマンドが紐づいている。
                  ボタンを押すことでvscodeAPIのリストから地域を選択、ワークスペースに保存されるようにする。
                  その後、ワークスペースの情報を参照して天気予報を取得する。
                  取得した天気予報をボタンに表示後、ボタンには選択した地域の天気予報webサイトを開くコマンドが紐づく。
                  ワークスペースに情報を保存しているため、次回起動時も設定を引き継ぐようになっている。
                </Typography>
              </Typography>
            </Box>
            <Box sx={{ marginTop: "30px" }}>
              <Typography
                className="context"
                variant="h6"
                align="left"
                sx={{ fontFamily: "Noto Serif JP, serif" }}
              >
                visxファイル
                <Typography
                  className="context"
                  variant="body2"
                  align="left"
                  sx={{ fontFamily: "Noto Serif JP, serif" }}
                >
                  拡張機能として配布するためにvisxファイルを作成する必要がある。方法については以下の記事を参照。
                </Typography>
                <Typography
                  className="context"
                  component="a"
                  variant="body2"
                  align="left"
                  href="https://qiita.com/HelloRusk/items/073b58c1605de224e67e"
                  sx={{ fontFamily: "Noto Serif JP, serif" }}
                >
                  https://qiita.com/HelloRusk/items/073b58c1605de224e67e
                </Typography>
              </Typography>
            </Box>
          </Box>
        </Box>
        <Box sx={{ marginTop: "100px" }}>
          <Typography
            className="context"
            variant="h6"
            align="left"
            sx={{ fontFamily: "Noto Serif JP, serif" }}
          >
            動作映像
          </Typography>
        </Box>
        <Box
          sx={{
            marginTop: "20px",
            backgroundColor: "#000000",
            overflow: "hidden",
          }}
        >
          <video width="90%" controls>
            <source src="./img/weather_PV.mp4" type="video/mp4" />
          </video>
        </Box>
        <Box sx={{ marginTop: "100px" }}>
          <Typography
            className="context"
            variant="h6"
            align="left"
            sx={{ fontFamily: "Noto Serif JP, serif" }}
          >
            改善点
          </Typography>
          <Box sx={{ marginTop: "10px" }}>
            <Typography
              className="context"
              variant="body2"
              align="left"
              sx={{ fontFamily: "Noto Serif JP, serif" }}
            >
              時間さえあれば実現可能なので全国対応したい。<br />
              vscodeAPIに不慣れなところがあり、UIが凝れていない。
              もう少し使いやすいデザインにすることができそう。
            </Typography>
          </Box>
        </Box>
        <Box sx={{ marginTop: "200px" }}></Box>
      </Box>
    </>
  );
};

export default Weather;
