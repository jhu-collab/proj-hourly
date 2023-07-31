import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import useStoreEvent from "../../../hooks/useStoreEvent";

/**
 * Child component that displays course calendar event details.
 * @returns event-specific information
 */
function CourseEventDetails() {
  const title = useStoreEvent((state) => state.title);
  const start = useStoreEvent((state) => state.start);
  const location = useStoreEvent((state) => state.location);
  const resources = useStoreEvent((state) => state.resources);

  const date = start.toDateString();
  
  return (
    <Stack direction="column" spacing={1}>
      <Typography variant="h4">{title}</Typography>
      {/*<Typography variant="h4">Agenda Description Goes Here</Typography>*/}
      <Typography>
        <strong>Date: </strong>
        {date}
      </Typography>
      <Typography>
        <strong>Location: </strong>
        {location}
      </Typography>
      <Typography>
        <strong>Additional Resources: </strong>
        {resources}
      </Typography>
    </Stack>
  );
}

export default CourseEventDetails;