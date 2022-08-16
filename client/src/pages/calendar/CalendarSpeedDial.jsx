import PlusOutlined from "@ant-design/icons/PlusOutlined";
import Box from "@mui/material/Box";
import SpeedDial from "@mui/material/SpeedDial";
import SpeedDialAction from "@mui/material/SpeedDialAction";
import SpeedDialIcon from "@mui/material/SpeedDialIcon";
import useTheme from "@mui/material/styles/useTheme";
import { useEffect, useState } from "react";
import { useEventStore } from "../../services/store";
import { useModal } from "@ebay/nice-modal-react";

/**
 * Component that represents the MUI SpeedDial component for the
 * "Calendar" page.
 * @param calendarRef reference to the FullCalendar component in
 *                    Calendar.jsx
 * @returns A component representing the "Calendar" expandable FAB.
 */
function CalendarSpeedDial({ calendarRef }) {
  const theme = useTheme();
  const modal = useModal("upsert-event");

  const setEvent = useEventStore((state) => state.setEvent);

  // speed dial toggler
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(!open);
  };

  const handleClick = () => {
    modal.show("upsert-event", { type: "create" });
    setEvent({});
  };

  useEffect(() => {
    if (modal.visible === false) {
      let calendarApi = calendarRef.current.getApi();
      calendarApi.unselect();
    }
  }, [modal.visible]);

  const actions = [
    { icon: <PlusOutlined />, name: "Create", onClick: handleClick },
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
    </>
  );
}

export default CalendarSpeedDial;
