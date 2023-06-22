import CloseOutlined from "@ant-design/icons/CloseOutlined";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import Popover from "@mui/material/Popover";
import Stack from "@mui/material/Stack";
import DeleteAction from "./DeleteAction";
import EditLocation from "./EditLocation";
import EventDetails from "./EventDetails";
import EditAction from "./EditAction";
import StudentDetails from "./StudentDetails";
import useStoreLayout from "../../../hooks/useStoreLayout";
import useStoreEvent from "../../../hooks/useStoreEvent";
import useStoreToken from "../../../hooks/useStoreToken";
import { decodeToken } from "react-jwt";

/**
 * The popover the is rendered when a calendar event is clicked on
 * @returns a popover display event information.
 */
function EventPopover() {
  const courseType = useStoreLayout((state) => state.courseType);
  const anchorEl = useStoreLayout((state) => state.eventAnchorEl);
  const setAnchorEl = useStoreLayout((state) => state.setEventAnchorEl);

  const hosts = useStoreEvent((state) => state.hosts);
  const token = useStoreToken((state) => state.token);
  const { id } = decodeToken(token);

  const isInstructor = courseType === "Instructor";
  const isHost = hosts.some((host) => host.id === id);

  return (
    <Popover
      open={Boolean(anchorEl)}
      anchorEl={anchorEl}
      onClose={() => setAnchorEl(null)}
      anchorOrigin={{
        vertical: "top",
        horizontal: "left",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
    >
      <Grid
        container
        direction="row"
        columnSpacing={3}
        sx={{ padding: 2, pr: 1 }}
      >
        <Grid item xs={8} sx={{ mt: 0.5 }}>
          <EventDetails />
        </Grid>
        <Grid item xs={4}>
          <Stack direction="row" justifyContent="flex-end">
            {(isHost || isInstructor) && <EditAction />}
            {(isHost || isInstructor) && <EditLocation />}
            {(isHost || isInstructor) && <DeleteAction />}
    
            <IconButton
              sx={{ fontSize: "20px" }}
              onClick={() => setAnchorEl(null)}
            >
              <CloseOutlined />
            </IconButton>
          </Stack>
        </Grid>
      </Grid>
      {courseType === "Student" && <StudentDetails />}
    </Popover>
  );
}

export default EventPopover;
