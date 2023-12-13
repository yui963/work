import { Paper } from "@mui/material";
import React from "react";

interface PlayerProps {
  youtubeLink: string;
}
const YoutubePlayer: React.FC<PlayerProps> = ({ youtubeLink }) => {
  return (
    <>
      <Paper elevation={3} style={{ padding: "20px" }}>
        <iframe
          width="560"
          height="315"
          src={youtubeLink}
          title="YouTube Video Player"
          allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </Paper>
    </>
  );
};

export default YoutubePlayer;
