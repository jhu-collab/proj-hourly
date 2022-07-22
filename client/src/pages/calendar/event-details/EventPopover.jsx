import CloseOutlined from "@ant-design/icons/CloseOutlined";
import InfoCircleOutlined from "@ant-design/icons/InfoCircleOutlined";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import Popover from "@mui/material/Popover";
import Stack from "@mui/material/Stack";
import DeleteAction from "./DeleteAction";
import EventDetails from "./EventDetails";
import EditAction from "./EditAction";
import useStore from "../../../services/store";
import { Button, Typography } from "@mui/material";

/**
 * The popover the is rendered when a calendar event is clicked on
 * @param {*} anchorEl - the element that popover is attached to
 * @param {*} handleClose - function that closes the popover
 * @returns a popover display event information.
 */
function EventPopover({ anchorEl, handleClose }) {
  const { courseType } = useStore();

  return (
    <Popover
      open={Boolean(anchorEl)}
      anchorEl={anchorEl}
      onClose={handleClose}
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
            {courseType === "staff" && <IconButton sx={{ fontSize: "20px" }}>
              <InfoCircleOutlined />
            </IconButton>}
            {courseType === "staff" && (
              <EditAction handlePopoverClose={handleClose} />
            )}
            {courseType === "staff" && (
              <DeleteAction handlePopoverClose={handleClose} />
            )}
            <IconButton sx={{ fontSize: "20px" }} onClick={handleClose}>
              <CloseOutlined />
            </IconButton>
          </Stack>
        </Grid>
      </Grid>
      <Stack alignItems="center" spacing={2}>
        <Typography color="red" paddingX={2}>You are not registered for this session</Typography>
        <Button variant="contained" fullWidth>Sign Up</Button>
      </Stack>
    </Popover>
  );
}

export default EventPopover;
