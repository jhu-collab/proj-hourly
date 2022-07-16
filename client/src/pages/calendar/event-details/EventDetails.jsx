import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import { useState, useEffect } from "react";
import { getLocaleTime } from "../../../utils/helpers";

function EventDetails({ event }) {
  const { start, end, extendedProps } = event;
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [location, setLocation] = useState("");

  useEffect(() => {
    if (start) {
      setDate(start.toDateString());
      const startTimeStr = start.toUTCString().substring(17, 22);
      setStartTime(getLocaleTime(startTimeStr));
    }

    if (end) {
      const endTimeStr = end.toUTCString().substring(17, 22);
      setEndTime(getLocaleTime(endTimeStr));
    }

    setLocation(extendedProps?.location);
  }, [start, end, extendedProps]);

  return (
    <Stack direction="column" spacing={1}>
      <Typography variant="h4">{event.title}</Typography>
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
