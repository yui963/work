import {
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Typography,
} from "@mui/material";

const Work = () => {
  return (
    <Card>
      <CardMedia component="img" image="./img/Equinox.jpg"></CardMedia>
      <CardContent>
        <Typography gutterBottom variant="h6" align="left">
          イクイノックスの写真
        </Typography>
        <Typography variant="body2" color="text.secondary" align="left">
          イクイノックスは父キタサンブラック、母シャトーブランシュ
        </Typography>
      </CardContent>
      <CardActions></CardActions>
    </Card>
  );
};

export default Work;
