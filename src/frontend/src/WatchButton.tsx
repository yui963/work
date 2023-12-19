import { Button, CircularProgress } from "@mui/material";
import React from "react";

interface Props {
  handleClick: () => void;
  loading: boolean;
}

const WatchButton: React.FC<Props> = ({ handleClick, loading }) => {
  return (
    <>
      <Button
        variant="outlined"
        onClick={() => handleClick()}
        disabled={loading}
        style={{ textTransform: "none" }}
      >
        {loading ? <CircularProgress size={20} /> : "Watch"}
      </Button>
    </>
  );
};

export default WatchButton;
