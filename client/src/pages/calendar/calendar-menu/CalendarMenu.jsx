import Stack from "@mui/material/Stack";
import Grid from "@mui/material/Grid";
import useStoreLayout from "../../../hooks/useStoreLayout";
import CalendarFilters from "./CalendarFilters";
import CalendarViews from "./CalendarViews";



/**
 * Represents the calendar menu.
 * @returns calendar menu
 */
function CalendarMenu({ calendarRef, isStaff, setFiltered, setMaxEventsStacked}) {


  const courseType = useStoreLayout((state) => state.courseType);

  if (isStaff) {
    return (
      <Stack padding={0.5} spacing={2}>
      <Grid container spacing = {2}>
        <Grid item xs = {12} md = {9}
        justifyContent = "center">
          <CalendarViews 
            calendarRef={calendarRef} 
            setMaxEventsStacked={setMaxEventsStacked}/>
        </Grid>
        <Grid item xs = {4} md = {3}>
          <CalendarFilters setFiltered = {setFiltered}/>
        </Grid>
      </Grid>
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
