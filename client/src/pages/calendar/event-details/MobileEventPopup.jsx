import CloseOutlined from "@ant-design/icons/CloseOutlined";
import EditOutlined from "@ant-design/icons/EditOutlined";
import InfoCircleOutlined from "@ant-design/icons/InfoCircleOutlined";
import { Button, Typography } from "@mui/material";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import useStore from "../../../services/store";
import DeleteAction from "./DeleteAction";
import EditAction from "./EditAction";
import EventDetails from "./EventDetails";

/**
 * Mimics the EventPopover component, however, this component is a Popup (Mui Dialog).
 * This component was created because popovers don't translate too well to
 * mobile devices.
 * @param {Boolean} open - state variable that manages whether popup is open
 * @param {*} handlePopupToggle - toggles the opening of the popup
 * @returns an event details popup component
 */
function MobileEventPopup({ open, handlePopupToggle }) {
  const { courseType } = useStore();

  // TODO: Maybe we can modify the Popup component to promote reusability!
  return (
    <Dialog open={open} onClose={handlePopupToggle} fullWidth maxWith="xs">
      <DialogContent>
        <Grid container direction="row" columnSpacing={3}>
          <Grid item xs={10} sx={{ mt: 0.5 }}>
            <EventDetails />
          </Grid>
          <Grid item xs={2}>
            <Stack direction="column" alignItems="flex-end">
              <IconButton sx={{ fontSize: "20px" }} onClick={handlePopupToggle}>
                <CloseOutlined />
              </IconButton>
              {courseType === "staff" && (
                <IconButton sx={{ fontSize: "20px" }}>
                  <InfoCircleOutlined />
                </IconButton>
              )}
              {courseType === "staff" && (
                <EditAction handlePopoverClose={handlePopupToggle} />
              )}
              {courseType === "staff" && (
                <DeleteAction handlePopoverClose={handlePopupToggle} />
              )}
            </Stack>
          </Grid>
        </Grid>
      </DialogContent>
      {courseType === "student" && (
        <Stack alignItems="center" spacing={2}>
          <Typography color="red">
            You are not registered for this session
          </Typography>
          <Button variant="contained" fullWidth>
            Sign Up
          </Button>
        </Stack>
      )}
    </Dialog>
  );
}

export default MobileEventPopup;
