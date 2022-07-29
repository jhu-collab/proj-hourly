import PlusOutlined from "@ant-design/icons/PlusOutlined";
import Box from "@mui/material/Box";
import SpeedDial from "@mui/material/SpeedDial";
import SpeedDialAction from "@mui/material/SpeedDialAction";
import SpeedDialIcon from "@mui/material/SpeedDialIcon";
import useTheme from "@mui/material/styles/useTheme";
import { useEffect, useState } from "react";
import { useEventStore } from "../../services/store";
import UpsertEvent from "./upsert-event/UpsertEvent";
import { usePopupState } from "material-ui-popup-state/hooks";

/**
 * Component that represents the MUI SpeedDial component for the
 * "Calendar" page.
 * @param calendarRef reference to the FullCalendar component in
 *                    Calendar.jsx
 * @param {*} popupState (required) object that handles that state
 *                       of the popup component (object returned from
 *                       usePopupState hook from material-ui-popup-state)
 * @returns A component representing the "Calendar" expandable FAB.
 */
function CalendarSpeedDial({ calendarRef, popupState }) {
  const theme = useTheme();

  const { setEvent } = useEventStore();

  // speed dial toggler
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(!open);
  };

  useEffect(() => {
    popupState.isOpen && setEvent({});
    if (popupState.isOpen === false) {
      let calendarApi = calendarRef.current.getApi();
      calendarApi.unselect();
    }
  }, [popupState.isOpen]);

  const actions = [
    { icon: <PlusOutlined />, name: "Create", onClick: popupState.open },
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
      <UpsertEvent popupState={popupState} />
    </>
  );
}

export default CalendarSpeedDial;
