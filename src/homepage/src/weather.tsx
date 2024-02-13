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
                <li>プログラミング中に雨に気が付かないことがある</li>
                <li>研究でvscode拡張機能実装するかもしれないため触りたい</li>
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
          >
            使用ライブラリ
          </Typography>
          <Box sx={{ marginTop: "10px" }}>
            <Typography
              className="context"
              variant="body1"
              align="left"
              sx={{ fontFamily: "Noto Serif JP, serif" }}
            >
              <ol className="list">
                <li>Yeoman</li>
                <Typography
                  className="context"
                  variant="body2"
                  align="left"
                  sx={{ fontFamily: "Noto Serif JP, serif" }}
                >
                  Yeomanを用いてテンプレートをインストールする。
                </Typography>
              </ol>
            </Typography>
          </Box>
        </Box>
        <Box sx={{ marginTop: "100px" }}>
          <Typography
            className="context"
            variant="h6"
            align="left"
            sx={{ fontFamily: "Noto Serif JP, serif" }}
          >
            アーキテクチャ
          </Typography>
          <Box sx={{ marginTop: "10px" }}>
            <Typography
              className="context"
              variant="body1"
              align="left"
              sx={{ fontFamily: "Noto Serif JP, serif" }}
            >
              <ol className="list">
                <li>Yeoman</li>
                <Typography
                  className="context"
                  variant="body2"
                  align="left"
                  sx={{ fontFamily: "Noto Serif JP, serif" }}
                >
                  Yeomanを用いてテンプレートをインストールする。
                </Typography>
              </ol>
            </Typography>
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
          <video width="95%" controls>
            <source src="./img/HRM_PV.mp4" type="video/mp4" />
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
              <Typography
                className="context"
                variant="h6"
                align="left"
                sx={{ fontFamily: "Noto Serif JP, serif" }}
              >
                Seleniumの動作が遅い
              </Typography>
              <Typography
                className="context"
                variant="body2"
                align="left"
                sx={{ fontFamily: "Noto Serif JP, serif" }}
              >
                バックエンドにリクエストを出してから、レスポンスが返ってくるまで５秒ほど要している。
                バックエンドで触っているときはあまり気にならなかったが、webページ上で時間が掛かるとかなり気になった。
                クリックなどを必要とせずに目的のページへアクセスできているため、BeautifulSoupでも代用が可能。
                ネットで調べてみるとBeautifulSoupの方が明らかに早いため、速度を上げたいならBeautifulSoupで実装するべき。
              </Typography>
            </Typography>
          </Box>
        </Box>
        <Box sx={{ marginTop: "200px" }}></Box>
      </Box>
    </>
  );
};

export default Weather;
