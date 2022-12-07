import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import { useState } from "react";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

/**
 * Toggle button group component that is used to switch the views
 * of the calendar
 * @param calendarRef reference to the FullCalendar component in
 *                    Calendar.jsx
 * @returns Calendar view toggle.
 */
function CalendarViews({ calendarRef }) {
  const [alignment, setAlignment] = useState("week");

  const handleChange = (event, newAlignment) => {
    if (newAlignment != null) {
      setAlignment(newAlignment);
      let calendarApi = calendarRef.current.getApi();
      newAlignment === "day"
        ? calendarApi.changeView("timeGridDay")
        : newAlignment === "week"
        ? calendarApi.changeView("timeGridWeek")
        : calendarApi.changeView("dayGridMonth");
    }
  };

  const sxToggleButton = {
    color: "white",
    border: 0,
    fontWeight: 600,
    "&:hover": {
      bgcolor: "secondary.main",
      color: "text.primary",
    },
    "&.Mui-selected": {
      bgcolor: "secondary.main",
      borderRadius: 1,
      color: "text.primary",
      "&:hover": {
        color: "text.primary",
        bgcolor: "secondary.main",
      },
    },
  };

  return (
    <Stack direction="column" spacing={1}>
      <Typography variant="subtile1" fontWeight={600} color="text.secondary">
        view by
      </Typography>
      <ToggleButtonGroup
        sx={{
          bgcolor: "tertiary.main",
          boxShadow:
            "0px 3px 1px -2px rgba(0, 0, 0, 0.2), 0px 2px 2px rgba(0, 0, 0, 0.14), 0px 1px 5px rgba(0, 0, 0, 0.12)",
        }}
        value={alignment}
        exclusive
        fullWidth
        onChange={handleChange}
      >
        <ToggleButton value="day" sx={sxToggleButton}>
          DAY
        </ToggleButton>
        <ToggleButton value="week" sx={sxToggleButton}>
          WEEK
        </ToggleButton>
        <ToggleButton value="month" sx={sxToggleButton}>
          MONTH
        </ToggleButton>
      </ToggleButtonGroup>
    </Stack>
  );
}

export default CalendarViews;
