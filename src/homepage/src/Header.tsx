import { AppBar, Container, Toolbar } from "@mui/material";
import React from "react";

const Header = () => {
  const whiteStyle = {
    backgroundColor: "white",
  };

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
