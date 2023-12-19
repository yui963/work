import { Typography } from "@mui/material";
import Work from "./Work.tsx";
import { Link } from "react-router-dom";
const Context: React.FC = () => {
  const HorseRaceMovie = ["python", "typescript"];
  return (
    <div>
      <Typography
        gutterBottom
        variant="h4"
        align="left"
        style={{ color: "#000000" }}
        sx={{ fontFamily: "Noto Serif JP, serif" }}
      >
        Works
      </Typography>
      <Link to="/HRM">
        <Work
          name="レース映像自動取得"
          image="./img/HorseRacingMoviePic.png"
          tags={HorseRaceMovie}
        />
      </Link>
    </div>
  );
};

export default Context;
