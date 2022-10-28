import Box from "@mui/material/Box";
import SwipeableDrawer from "@mui/material/SwipeableDrawer";
import CalendarMenu from "./CalendarMenu";
import styled from "@mui/material/styles/styled";
import grey from "@mui/material/colors/grey";
import useStoreLayout from "../../../hooks/useStoreLayout";

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

/**
 * Utilizes the MUI Swipeable Drawer component to create a calendar menu
 * for mobile devices.
 * @returns a mobile calendar menu
 */
function MobileCalendarMenu({calendarRef}) {
  const open = useStoreLayout((state) => state.mobileCalMenu);
  const setOpen = useStoreLayout((state) => state.setMobileCalMenu);

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
        <CalendarMenu calendarRef={calendarRef}/>
      </Box>
    </SwipeableDrawer>
  );
}

export default MobileCalendarMenu;
