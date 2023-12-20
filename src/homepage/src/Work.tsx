import {
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Typography,
} from "@mui/material";
import React from "react";
import TagChip from "./TagChip";

interface WorkProps {
  name: string;
  image: string;
  tags: string[];
}

const Work: React.FC<WorkProps> = ({ name, image, tags }) => {
  return (
    <Card sx={{ maxWidth: 250, maxHeight: 280 }}>
      <CardActionArea>
        <CardMedia
          component="img"
          image={image}
          sx={{
            width: "100%",
            height: "auto",
            display: "center",
          }}
        />
        <CardContent sx={{ textAlign: "left" }}>
          <Typography variant="h6" fontWeight="bold">
            {name}
          </Typography>
          <div>
            {tags.map((tag) => (
              <TagChip tag={tag}></TagChip>
            ))}
          </div>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default Work;
