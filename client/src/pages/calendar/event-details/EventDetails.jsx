import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import { DateTime } from "luxon";
import useStoreEvent from "../../../hooks/useStoreEvent";

/**
 * Child component that displays event details.
 * @returns event-specific information
 */
function EventDetails() {
  const title = useStoreEvent((state) => state.title);
  const start = useStoreEvent((state) => state.start);
  const end = useStoreEvent((state) => state.end);
  const location = useStoreEvent((state) => state.location);

  const date = start.toDateString();
  const startTime = DateTime.fromJSDate(start).toLocaleString(
    DateTime.TIME_SIMPLE
  );
  const endTime = DateTime.fromJSDate(end).toLocaleString(DateTime.TIME_SIMPLE);

  return (
    <Stack direction="column" spacing={1}>
      <Typography variant="h4">{title}</Typography>
      <Typography>
        <strong>Date: </strong>
        {date}
      </Typography>
      <Typography>
        <strong>Time: </strong>
        {startTime} - {endTime}
      </Typography>
      <Typography>
        <strong>Location: </strong>
        {location}
      </Typography>
    </Stack>
  );
}

export default EventDetails;
