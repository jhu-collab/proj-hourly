import { PlusOutlined } from "@ant-design/icons";
import {
  Box,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  useTheme,
} from "@mui/material";
import React, { useState } from "react";
import useStore from "../../services/store";

/**
 * Component that represents the MUI SpeedDial component for the
 * "Your Courses" page.
 * @returns A component representing the "Your Courses" expandable FAB.
 */
function CalendarSpeedDial() {
  const theme = useTheme();

  const { createEventPopup, toggleCreateEventPopup } = useStore();

  // speed dial toggler
  const [open, setOpen] = useState(false);

  const handleOpen = (event) => {
    setOpen(!open);
  };

  // popup toggler
  const [openPopup, setOpenPopup] = useState(createEventPopup);
  const handlePopupToggle = () => {
    setOpenPopup(!openPopup);
    toggleCreateEventPopup(!openPopup);
  };

  const actions = [
    { icon: <PlusOutlined />, name: "Create", onClick: handlePopupToggle },
  ];

  return (
    <>
      <Box
        sx={{
          position: "fixed",
          bottom: 1,
          right: 2,
          transform: "translateZ(0px)",
          flexGrow: 1,
          zIndex: theme.zIndex.speedDial,
        }}
      >
        <SpeedDial
          ariaLabel="Calendar SpeedDial"
          sx={{ position: "absolute", bottom: 16, right: 16 }}
          icon={<SpeedDialIcon />}
          onClick={handleOpen}
          open={open}
        >
          {actions.map((action) => (
            <SpeedDialAction
              key={action.name}
              icon={action.icon}
              tooltipTitle={action.name}
              onClick={action.onClick}
            />
          ))}
        </SpeedDial>
      </Box>
      {/* <CreateCourse open={openPopup} handlePopupToggle={handlePopupToggle} /> */}
    </>
  );
}

export default CalendarSpeedDial;
