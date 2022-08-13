import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Toolbar from "@mui/material/Toolbar";
import TimeTabs from "./TimeTabs";
import FilterFilled from "@ant-design/icons/FilterFilled";
import useTheme from "@mui/material/styles/useTheme";

function RegistrationsBar() {
  const theme = useTheme();

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" elevation={1} sx={{borderRadius: 1, backgroundColor: "white"}}>
        <Toolbar>
          <TimeTabs />
          <Box sx={{ flexGrow: 1 }} />
          <IconButton>
            <FilterFilled style={{color: theme.palette.primary.main}} />
          </IconButton>
        </Toolbar>
      </AppBar>
    </Box>
  );
}

export default RegistrationsBar;