import { Box, SwipeableDrawer } from "@mui/material";
import { useState } from "react";
import CalendarMenu from "./CalendarMenu";
import { styled } from "@mui/material/styles";
import { grey } from "@mui/material/colors";
import { useLayoutStore } from "../../services/store";

const drawerBleeding = 0;

const Puller = styled(Box)(({ theme }) => ({
  width: 30,
  height: 6,
  backgroundColor: theme.palette.mode === "light" ? grey[300] : grey[900],
  borderRadius: 3,
  position: "absolute",
  top: 8,
  left: "calc(50% - 15px)",
}));

function MobileCalendarMenu() {
  const open = useLayoutStore((state) => state.mobileCalMenu);
  const setOpen = useLayoutStore((state) => state.setMobileCalMenu);

  const toggleDrawer = (newOpen) => () => {
    setOpen(newOpen);
  };

  return (
    <SwipeableDrawer
      anchor="bottom"
      open={open}
      onClose={toggleDrawer(false)}
      onOpen={toggleDrawer(true)}
      swipeAreaWidth={drawerBleeding}
      disableSwipeToOpen={false}
      ModalProps={{
        keepMounted: true,
        backgroundColor: "white",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: -drawerBleeding,
          borderTopLeftRadius: 8,
          borderTopRightRadius: 8,
          visibility: "visible",
          right: 0,
          left: 0,
        }}
      >
        <Puller />
      </Box>
      <Box
        sx={{
          px: 2,
          pb: 2,
          height: "100%",
          overflow: "auto",
        }}
      >
        <CalendarMenu />
      </Box>
    </SwipeableDrawer>
  );
}

export default MobileCalendarMenu;
