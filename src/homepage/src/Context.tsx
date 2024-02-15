import { Typography } from "@mui/material";
import Work from "./Work.tsx";
import { Link } from "react-router-dom";
import { useEffect } from "react";
const Context: React.FC = () => {
  const HorseRaceMovie = ["python", "typescript"];
  const weather = ["typescript"];
  useEffect(() => {
    document.title = 'Top Page';
  }, []);
  return (
    <>
      <Typography
        gutterBottom
        className="border"
        variant="h4"
        align="left"
        fontWeight="bold"
        style={{ color: "#000000" }}
        sx={{ fontFamily: "Noto Serif JP, serif" }}
      >
        Works
      </Typography>
      <div style={{ display: "flex", flexDirection: "row" }}>
        <div style={{ marginRight: "20px" }}>
          <Link to="/HRM">
            <Work
              name="レース映像自動取得"
              image="./img/HorseRacingMoviePic.png"
              tags={HorseRaceMovie}
            />
          </Link>
        </div>
        <Link to="/Weather">
          <Work
            name="vscode拡張機能(天気)"
            image="./img/vscode-extension.png"
            tags={weather}
          />
        </Link>
      </div>
    </>
  );
};

export default Context;
