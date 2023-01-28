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
    <Stack padding={2} spacing={6}>
      <CalendarViews calendarRef={calendarRef} />
      {/* TODO: UNFINISHED FEATURE */}
      {/* <CalendarFilters /> */}
      {courseType === "staff" && <CalendarAdd calendarRef={calendarRef} />}
    </Stack>
  );
}

export default CalendarMenu;
