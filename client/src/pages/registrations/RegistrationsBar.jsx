import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Toolbar from "@mui/material/Toolbar";
import RegistrationTabs from "./RegistrationTabs";
import FilterOutlined from "@ant-design/icons/FilterOutlined";
import FilterFilled from "@ant-design/icons/FilterFilled";
import useTheme from "@mui/material/styles/useTheme";
import { useState } from "react";

/**
 * Represents the app bar that handles the management of registrations.
 * @returns the registrations bar.
 */
function RegistrationsBar() {
  const theme = useTheme();
  const [filter, setFilter] = useState(false);

  const onClick = () => {
    setFilter(!filter);
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar
        position="static"
        elevation={1}
        sx={{ borderRadius: 1, backgroundColor: "white" }}
      >
        <Toolbar>
          <RegistrationTabs />
          <Box sx={{ flexGrow: 1 }} />
          {/* TODO: Need to create a filter panel for registrations */}
          <IconButton onClick={onClick}>
            {filter ? (
              <FilterFilled style={{ color: theme.palette.primary.main }} />
            ) : (
              <FilterOutlined style={{ color: theme.palette.primary.main }} />
            )}
          </IconButton>
        </Toolbar>
      </AppBar>
    </Box>
  );
}

export default RegistrationsBar;
