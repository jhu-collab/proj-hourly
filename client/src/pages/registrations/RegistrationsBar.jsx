import { AppBar, Box, IconButton, Toolbar } from "@mui/material";
import React from "react";
import TimeTabs from "./TimeTabs";
import FilterOutlined from "@ant-design/icons/FilterOutlined";

function RegistrationsBar() {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" color="default">
        <Toolbar>
          <TimeTabs />
          <Box sx={{ flexGrow: 1 }} />
          <IconButton>
            <FilterOutlined />
          </IconButton>
        </Toolbar>
      </AppBar>
    </Box>
  );
}

export default RegistrationsBar;
