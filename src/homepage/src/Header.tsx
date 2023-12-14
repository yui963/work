import { AppBar, Container, Toolbar } from "@mui/material";

const Header = () => {
  return (
    <>
      <AppBar position="fixed">
        <Container maxWidth="xl">
          <Toolbar></Toolbar>
        </Container>
      </AppBar>
    </>
  );
};

export default Header;
