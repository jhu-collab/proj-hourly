import Alert from "@mui/material/Alert";
import Typography from "@mui/material/Typography";
import useStoreLayout from "../../hooks/useStoreLayout";
import useQueryCourseEvents from "../../hooks/useQueryCourseEvents";
import { Grid } from "@mui/material";
import AgendaTopic from "./AgendaTopic";

function Agenda() {
  const { isLoading, error, data } = useQueryCourseEvents();
  const courseType = useStoreLayout((state) => state.courseType);

  if (isLoading) {
    return <Alert severity="warning">Retrieving course calendar event topics ...</Alert>;
  }

  if (error) {
    return <Alert severity="error">Unable to retrieve course calendar event topics</Alert>;
  }

  return (
    <>
      <Typography variant="h4" sx={{ marginBottom: 2.25 }}>
        Agenda
      </Typography>
      {courseType === "Instructor" && (
        <>
          <Grid container spacing={2}>
            {data.calendarEvents.map((calendarEvent) => {
              return (
                <Grid item xs={12} key={calendarEvent.date}>
                  <Grid item xs={12} key={calendarEvent.date}>
                    <AgendaTopic
                      topic={calendarEvent.title}
                      date={calendarEvent.date}
                      isCancelled={calendarEvent.isCancelled}
                      isRemote={calendarEvent.isRemote}
                    />
                  </Grid>
                </Grid>
              );
            })}
          </Grid>
        </>
      )}
    </>
  );
}

export default Agenda;
