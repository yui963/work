import { AppBar, Toolbar, Typography } from "@mui/material";

const Header = () => {
  return (
    <div>
      <AppBar position="fixed" style={{ backgroundColor: "white" }}>
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography
            component="a"
            href="/work/"
            variant="h4"
            style={{ color: "#000000" }}
            sx={{ fontFamily: "Noto Serif JP, serif" }}
          >
            Y.Y
          </Typography>
          <Typography
            component="a"
            href="/work/about"
            variant="h5"
            fontWeight="bold"
            style={{ color: "#000000" }}
            sx={{ fontFamily: "Noto Serif JP, serif" }}
          >
            About
          </Typography>
        </Toolbar>
      </AppBar>
    </div>
  );
};

export default Header;
