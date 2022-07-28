import PlusOutlined from "@ant-design/icons/PlusOutlined";
import Box from "@mui/material/Box";
import SpeedDial from "@mui/material/SpeedDial";
import SpeedDialAction from "@mui/material/SpeedDialAction";
import SpeedDialIcon from "@mui/material/SpeedDialIcon";
import useTheme from "@mui/material/styles/useTheme";
import { useState } from "react";
import useStore, { useEventStore } from "../../services/store";
import UpsertEvent from "./upsert-event/UpsertEvent";

/**
 * Component that represents the MUI SpeedDial component for the
 * "Calendar" page.
 * @param calendarRef reference to the FullCalendar component in
 *                    Calendar.jsx
 * @returns A component representing the "Calendar" expandable FAB.
 */
function CalendarSpeedDial({ calendarRef }) {
  const theme = useTheme();

  const { createEventPopup, toggleCreateEventPopup } = useStore();

  const { setEvent } = useEventStore();

  // speed dial toggler
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(!open);
  };

  // popup toggler
  const handlePopupToggle = () => {
    open === true && setEvent({});
    if (open === false) {
      let calendarApi = calendarRef.current.getApi();
      calendarApi.unselect();
    }
    toggleCreateEventPopup(!createEventPopup);
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
      <UpsertEvent
        open={createEventPopup}
        handlePopupToggle={handlePopupToggle}
      />
    </>
  );
}

export default CalendarSpeedDial;
