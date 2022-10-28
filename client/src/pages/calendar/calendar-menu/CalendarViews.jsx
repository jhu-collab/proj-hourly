import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import useTheme from "@mui/material/styles/useTheme";
import { useState } from "react";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

function CalendarViews({ calendarRef }) {
  const theme = useTheme();
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
    <Stack direction="column" spacing={2}>
      <Typography variant="subtile1" fontWeight={600} color="text.secondary">
        view by
      </Typography>
      <ToggleButtonGroup
        sx={{ bgcolor: "tertiary.main" }}
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
