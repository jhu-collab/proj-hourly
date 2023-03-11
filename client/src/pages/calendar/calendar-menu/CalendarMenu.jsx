import Stack from "@mui/material/Stack";
import useStoreLayout from "../../../hooks/useStoreLayout";
import CalendarFilters from "./CalendarFilters";
import CalendarViews from "./CalendarViews";



/**
 * Represents the calendar menu.
 * @returns calendar menu
 */
function CalendarMenu({ calendarRef, isStaff, filtered, setFiltered}) {


  const courseType = useStoreLayout((state) => state.courseType);

  if (isStaff) {
    return (
      <Stack padding={2} spacing={3}>
        <CalendarViews calendarRef={calendarRef} />
        <CalendarFilters filtered={filtered} setFiltered = {setFiltered}/>
      </Stack>
    );
  } else {
    return (
      <Stack padding={2} spacing={6}>
        <CalendarViews calendarRef={calendarRef} />
      </Stack>
    );

  }
  
}

export default CalendarMenu;
