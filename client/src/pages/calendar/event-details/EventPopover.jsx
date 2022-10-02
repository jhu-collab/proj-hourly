import CloseOutlined from "@ant-design/icons/CloseOutlined";
import InfoCircleOutlined from "@ant-design/icons/InfoCircleOutlined";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import Popover from "@mui/material/Popover";
import Stack from "@mui/material/Stack";
import DeleteAction from "./DeleteAction";
import EventDetails from "./EventDetails";
import EditAction from "./EditAction";
import StudentDetails from "./StudentDetails";

/**
 * The popover the is rendered when a calendar event is clicked on
 * @returns a popover display event information.
 */
function EventPopover() {
  const courseType = useStoreLayout((state) => state.courseType);
  const anchorEl = useStoreLayout((state) => state.eventAnchorEl);
  const setAnchorEl = useStoreLayout((state) => state.setEventAnchorEl);

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
            {courseType === "staff" && (
              <IconButton sx={{ fontSize: "20px" }}>
                <InfoCircleOutlined />
              </IconButton>
            )}
            {courseType === "staff" && <EditAction />}
            {courseType === "staff" && <DeleteAction />}
            <IconButton
              sx={{ fontSize: "20px" }}
              onClick={() => setAnchorEl(null)}
            >
              <CloseOutlined />
            </IconButton>
          </Stack>
        </Grid>
      </Grid>
      {courseType === "student" && <StudentDetails />}
    </Popover>
  );
}

export default EventPopover;
