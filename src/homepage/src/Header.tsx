import { AppBar, Toolbar, Typography } from "@mui/material";

const Header = () => {
  return (
    <div>
      <AppBar position="fixed" style={{ backgroundColor: "white" }}>
        <Toolbar>
          <Typography
            component="a"
            href="/work/"
            variant="h5"
            style={{ color: "#000000" }}
            sx={{ fontFamily: "Noto Serif JP, serif" }}
          >
            Y.Y
          </Typography>
        </Toolbar>
      </AppBar>
    </div>
  );
};

export default Header;
