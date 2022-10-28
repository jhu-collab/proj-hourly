import Stack from "@mui/material/Stack";
import useStoreLayout from "../../../hooks/useStoreLayout";
import CalendarAdd from "./CalendarAdd";
import CalendarFilters from "./CalendarFilters";
import CalendarViews from "./CalendarViews";

/**
 * Represents the calendar menu.
 * @returns calendar menu
 */
function CalendarMenu({ calendarRef }) {
  const courseType = useStoreLayout((state) => state.courseType);

  return (
    <Stack padding={2} spacing={3}>
      <CalendarViews calendarRef={calendarRef} />
      <CalendarFilters />
      {courseType === "staff" && <CalendarAdd />}
    </Stack>
  );
}

export default CalendarMenu;
