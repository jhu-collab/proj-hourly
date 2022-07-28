import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import { useEventStore } from "../../../services/store";
import moment from "moment";

/**
 * Child component that displays event details.
 * @returns event-specific information
 */
function EventDetails() {
  const { title, start, end, location } = useEventStore();
  const date = start.toDateString();
  const startTime = moment(start).utc().format("LT");
  const endTime = moment(end).utc().format("LT");

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
