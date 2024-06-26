import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import useTheme from "@mui/material/styles/useTheme";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import useMediaQuery from "@mui/material/useMediaQuery";
import Drawer from "./Drawer";
import Header from "./Header";
import { menuItems } from "../menu-items";
import Breadcrumbs from "../components/Breadcrumbs";
import useStoreLayout from "../hooks/useStoreLayout";

function MainLayout() {
  const theme = useTheme();
  const matchDownLG = useMediaQuery(theme.breakpoints.down("xl"));
  const openSidebar = useStoreLayout((state) => state.openSidebar);
  const toggleOpenSidebar = useStoreLayout((state) => state.toggleOpenSidebar);

  // drawer toggler
  const [open, setOpen] = useState(openSidebar);
  const handleDrawerToggle = () => {
    setOpen(!open);
    toggleOpenSidebar(!open);
  };

  // set media wise responsive drawer
  useEffect(() => {
    setOpen(!matchDownLG);
    toggleOpenSidebar(!matchDownLG);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchDownLG]);

  useEffect(() => {
    if (open !== openSidebar) setOpen(openSidebar);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openSidebar]);

  return (
    <Box sx={{ display: "flex", width: "100%", height: "98.5vh" }}>
      <Header open={open} handleDrawerToggle={handleDrawerToggle} />
      <Drawer open={open} handleDrawerToggle={handleDrawerToggle} />
      <Box
        component="main"
        sx={{ width: "100%", flexGrow: 1, p: { xs: 2, sm: 3 } }}
      >
        <Toolbar />
        <Breadcrumbs
          navigation={menuItems()}
          title
          divider={false}
        />
        <Outlet />
      </Box>
    </Box>
  );
}

export default MainLayout;
