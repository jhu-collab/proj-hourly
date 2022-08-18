import { Box, Paper } from "@mui/material";
import CalendarFilters from "./CalendarFilters";

function CalendarMenu() {
  return (
    <Paper variant="outlined" square sx={{ height: "76vh", p: 2 }}>
      <CalendarFilters />
    </Paper>
  );
}

export default CalendarMenu;
