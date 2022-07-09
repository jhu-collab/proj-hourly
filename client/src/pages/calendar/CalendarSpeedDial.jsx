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
import CreateEvent from "./create-event/CreateEvent";

/**
 * Component that represents the MUI SpeedDial component for the
 * "Calendar" page.
 * @returns A component representing the "Calendar" expandable FAB.
 */
function CalendarSpeedDial() {
  const theme = useTheme();

  const {
    createEventPopup,
    toggleCreateEventPopup,
    setCreateEventDate,
    setCreateEventStartTime,
    setCreateEventEndTime,
  } = useStore();

  // speed dial toggler
  const [open, setOpen] = useState(false);

  const handleOpen = (event) => {
    setOpen(!open);
  };

  // popup toggler
  const handlePopupToggle = () => {
    toggleCreateEventPopup(!createEventPopup);
    !createEventPopup && setCreateEventDate();
    !createEventPopup && setCreateEventStartTime();
    !createEventPopup && setCreateEventEndTime();
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
      <CreateEvent
        open={createEventPopup}
        handlePopupToggle={handlePopupToggle}
      />
    </>
  );
}

export default CalendarSpeedDial;
