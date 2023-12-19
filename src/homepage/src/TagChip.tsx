import { Chip } from "@mui/material";
import React from "react";

interface TagProps {
  tag: string;
}
const TagChip: React.FC<TagProps> = ({ tag }) => {
  return (
    <Chip
      label={tag}
      variant="filled"
      style={{
        color: "#FFFFFF",
        backgroundColor: "#808080",
        borderColor: "#808080",
      }}
      sx={{ borderRadius: 2, marginRight: 0.5, height: "20px" }}
    />
  );
};

export default TagChip;
