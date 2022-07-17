import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import { getLocaleTime } from "../../../utils/helpers";
import { useEventStore } from "../../../services/store";

/**
 * Child component that displays event details.
 * @returns event-specific information
 */
function EventDetails() {
  const { title, start, end, location } = useEventStore();
  const date = start.toDateString();

  const startTimeStr = start.toUTCString().substring(17, 22);
  const startTime = getLocaleTime(startTimeStr);

  const endTimeStr = end.toUTCString().substring(17, 22);
  const endTime = getLocaleTime(endTimeStr);

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
