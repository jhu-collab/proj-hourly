import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import { useEventStore } from "../../../services/store";
import { DateTime } from "luxon";

/**
 * Child component that displays event details.
 * @returns event-specific information
 */
function EventDetails() {
  const title = useEventStore((state) => state.title);
  const start = useEventStore((state) => state.start);
  const end = useEventStore((state) => state.end);
  const location = useEventStore((state) => state.location);
  const timeInterval = useEventStore((state) => state.timeInterval);

  const date = start.toDateString();
  const startTime = DateTime.fromJSDate(start, { zone: "utc" }).toLocaleString(
    DateTime.TIME_SIMPLE
  );
  const endTime = DateTime.fromJSDate(end, { zone: "utc" }).toLocaleString(
    DateTime.TIME_SIMPLE
  );
  const minutes = " minutes";

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
      <Typography>
        <strong>Time Limit Per Student: </strong>
        {timeInterval}
        {minutes}
      </Typography>
    </Stack>
  );
}

export default EventDetails;
