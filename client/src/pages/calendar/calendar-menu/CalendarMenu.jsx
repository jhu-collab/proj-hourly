import Stack from "@mui/material/Stack";
import CalendarFilters from "./CalendarFilters";
import CalendarViews from "./CalendarViews";

/**
 * Represents the calendar menu.
 * @returns calendar menu
 */
function CalendarMenu() {
  // TODO: We can add more children components if we decide
  // that additional functionally can be added to the calendar
  return (
    <Stack padding={2}>
      <CalendarViews />
      <CalendarFilters />
    </Stack>
  );
}

export default CalendarMenu;
