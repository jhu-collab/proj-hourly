import CloseOutlined from "@ant-design/icons/CloseOutlined";
import InfoCircleOutlined from "@ant-design/icons/InfoCircleOutlined";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import { useLayoutStore } from "../../../services/store";
import DeleteAction from "./DeleteAction";
import EditAction from "./EditAction";
import EventDetails from "./EventDetails";
import StudentDetails from "./StudentDetails";
import { bindDialog } from "material-ui-popup-state/hooks";

/**
 * Mimics the EventPopover component, however, this component is a Popup (Mui Dialog).
 * This component was created because popovers don't translate too well to
 * mobile devices.
 * @param {*} editPopupState (required) object that handles that state
 *                       of the UpsertEventPopup component
 * @param {*} popupState (required) object that handles that state
 *                       of the popup component (object returned from
 *                       usePopupState hook from material-ui-popup-state)
 * @returns an event details popup component
 */
function MobileEventPopup({ editPopupState, popupState }) {
  const courseType = useLayoutStore((state) => state.courseType);

  // TODO: Maybe we can modify the Popup component to promote reusability!
  return (
    <Dialog fullWidth maxWidth="xs" {...bindDialog(popupState)}>
      <DialogContent>
        <Grid container direction="row" columnSpacing={3}>
          <Grid item xs={10} sx={{ mt: 0.5 }}>
            <EventDetails />
          </Grid>
          <Grid item xs={2}>
            <Stack direction="column" alignItems="flex-end">
              <IconButton sx={{ fontSize: "20px" }} onClick={popupState.close}>
                <CloseOutlined />
              </IconButton>
              {courseType === "staff" && (
                <IconButton sx={{ fontSize: "20px" }}>
                  <InfoCircleOutlined />
                </IconButton>
              )}
              {courseType === "staff" && (
                <EditAction
                  popupState={editPopupState}
                  onClose={popupState.close}
                />
              )}
              {courseType === "staff" && (
                <DeleteAction onClose={popupState.close} />
              )}
            </Stack>
          </Grid>
        </Grid>
      </DialogContent>
      {courseType === "student" && <StudentDetails />}
    </Dialog>
  );
}

export default MobileEventPopup;
