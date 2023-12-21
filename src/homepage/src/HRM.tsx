import { Box, Typography } from "@mui/material";

const HRM = () => {
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
            レース映像自動取得ツール
          </Typography>
        </Box>
        <Box sx={{ marginTop: "40px" }}>
          <img width="100%" src="./img/HRMdetail.png" />
        </Box>
        <Box sx={{ marginTop: "40px" }}>
          <Typography
            className="context"
            variant="h6"
            align="left"
            sx={{ fontFamily: "Noto Serif JP, serif" }}
          >
            Webページ内にあるセレクトボックスからレース名と開催年を選択することで、該当するレース映像を表示させます。
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
                <li>pythonを用いてhtml解析をしたい</li>
                <li>今後使う予定があるためtypescriptに触りたい</li>
                <li>解析結果をwebページに表示したい</li>
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
            使用ライブラリ等
          </Typography>
          <Box sx={{ marginTop: "10px" }}>
            <Typography
              className="context"
              variant="body1"
              align="left"
              fontWeight="bold"
              sx={{ fontFamily: "Noto Serif JP, serif" }}
            >
              バックエンド
            </Typography>
            <Typography
              className="context"
              variant="body1"
              align="left"
              sx={{ fontFamily: "Noto Serif JP, serif" }}
            >
              <ol className="list">
                <li>Flask</li>
                <Typography
                  className="context"
                  variant="body2"
                  align="left"
                  sx={{ fontFamily: "Noto Serif JP, serif" }}
                >
                  python用のwebアプリケーションフレームワーク。
                  フロントエンドとのやり取りをするためのwebサーバを立ち上げるために用いる。
                  使ったことは無かったが、出回っている情報が多そうだったため選択。
                </Typography>
                <li>Selenium</li>
                <Typography
                  className="context"
                  variant="body2"
                  align="left"
                  sx={{ fontFamily: "Noto Serif JP, serif" }}
                >
                  python用のwebブラウザ操作自動化フレームワーク。
                  webブラウザを操作しながら目的のhtml要素を取得する。
                  他にも選択肢があるが、以前触ったことがあるためSeleniumを選択した。
                </Typography>
              </ol>
            </Typography>
            <Typography
              className="context"
              variant="body1"
              align="left"
              fontWeight="bold"
              sx={{ fontFamily: "Noto Serif JP, serif" }}
            >
              フロントエンド
              <Typography
                className="context"
                variant="body1"
                align="left"
                sx={{ fontFamily: "Noto Serif JP, serif" }}
              >
                <ol className="list">
                  <li>React</li>
                  <Typography
                    className="context"
                    variant="body2"
                    align="left"
                    sx={{ fontFamily: "Noto Serif JP, serif" }}
                  >
                    フロントエンド開発ではreactが人気だということで、typescriptにも対応していることからもこれを選択。
                    viteを用いてテンプレートの作成・ビルドを行う。
                  </Typography>
                  <li>Material-UI</li>
                  <Typography
                    className="context"
                    variant="body2"
                    align="left"
                    sx={{ fontFamily: "Noto Serif JP, serif" }}
                  >
                    React用のUIコンポーネントライブラリ。
                    用意されたコンポーネントを用いることで、簡単に見栄えを良くすることが出来る。
                  </Typography>
                </ol>
              </Typography>
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
            アーキテクチャ図
          </Typography>
          <Typography
            className="context"
            variant="body2"
            align="left"
            sx={{ fontFamily: "Noto Serif JP, serif" }}
          >
            バックエンドとフロントエンドの通信を図に示すと以下のようになる。
            フロントエンドで選択された情報をバックエンドのAPIにpostし、
            バックエンドではその情報を元にhtml解析を行う。
            解析結果をレスポンスとし、それを受けとったフロントエンドは画面に表示させる。
          </Typography>
          <Box sx={{ marginTop: "20px" }}>
            <img width="60%" src="./img/front-back.png" />
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

export default HRM;
