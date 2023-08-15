import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import useStoreEvent from "../../../hooks/useStoreEvent";
import { Chip } from "@mui/material";

/**
 * Child component that displays course calendar event details.
 * @returns event-specific information
 */
function CourseEventDetails() {
  const title = useStoreEvent((state) => state.title);
  const start = useStoreEvent((state) => state.start);
  const location = useStoreEvent((state) => state.location);
  const isRemote = useStoreEvent((state) => state.isRemote);
  const resources = useStoreEvent((state) => state.resources);
  const isCancelled = useStoreEvent((state) => state.isCancelled);

  const date = start.toDateString();

  return (
    <Stack direction="column" spacing={1}>
      <Typography variant="h4" color={isCancelled ? "error.main" : "text.primary"}>{title}</Typography>
      <Typography color={isCancelled ? "error.main" : "text.primary"}>
        <strong>Date: </strong>
        {date}
      </Typography>
      <Typography color={isCancelled ? "error.main" : "text.primary"}>
        <strong>Location: </strong>
        {location}
      </Typography>
      {isRemote && <Chip label="Remote" sx={{ width: 70 }}/>}
      {(resources && resources !== "") && <Typography>
        <strong>Additional Resources: </strong>
        {resources}
      </Typography>}
    </Stack>
  );
}

export default CourseEventDetails;
