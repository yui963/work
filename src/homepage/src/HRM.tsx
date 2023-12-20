import { Box, Typography } from "@mui/material";

const HRM = () => {
  return (
    <>
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
          開発目的
        </Typography>
        <Box sx={{ marginTop: "10px" }}>
          <Typography
            className="context"
            variant="body2"
            align="left"
            sx={{ fontFamily: "Noto Serif JP, serif" }}
          >
            ・pythonを用いてhtml解析をしたい <br />
            ・解析結果をwebページに表示したい
            <br />
            ・直接動画を表示するツールはネット上に公開されていなかったため
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
            fontWeight="bold"
            sx={{ fontFamily: "Noto Serif JP, serif" }}
          >
            バックエンド
          </Typography>
          <Typography
            className="context"
            variant="body2"
            align="left"
            sx={{ fontFamily: "Noto Serif JP, serif" }}
          >
            ・flask <br />
            ・selenium
          </Typography>
          <Typography
            className="context"
            variant="body1"
            align="left"
            fontWeight="bold"
            sx={{ fontFamily: "Noto Serif JP, serif" }}
          >
            フロントエンド
          </Typography>
          <Typography
            className="context"
            variant="body2"
            align="left"
            sx={{ fontFamily: "Noto Serif JP, serif" }}
          >
            ・react <br />
            ・material-ui
          </Typography>
        </Box>
      </Box>
      <Box sx={{ marginTop: "100px" }}>
        <video width="560" height="315" controls>
          <source src="./img/valo.mp4" type="video/mp4" />
        </video>
      </Box>
    </>
  );
};

export default HRM;
