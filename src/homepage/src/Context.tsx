import { Typography } from "@mui/material";
import Work from "./Work.tsx";
import { Link } from "react-router-dom";
const Context: React.FC = () => {
  const HorseRaceMovie = ["python", "typescript"];
  const weather = ["typescript"];
  return (
    <>
      <Typography
        gutterBottom
        variant="h4"
        align="left"
        style={{ color: "#000000" }}
        sx={{ fontFamily: "Noto Serif JP, serif" }}
      >
        Works
      </Typography>
      <div style={{ display: "flex", flexDirection: "row" }}>
        <div style={{ marginRight: "10px" }}>
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
