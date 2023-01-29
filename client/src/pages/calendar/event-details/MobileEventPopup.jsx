import CloseOutlined from "@ant-design/icons/CloseOutlined";
import InfoCircleOutlined from "@ant-design/icons/InfoCircleOutlined";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import DeleteAction from "./DeleteAction";
import EditAction from "./EditAction";
import EventDetails from "./EventDetails";
import StudentDetails from "./StudentDetails";
import NiceModal, { useModal } from "@ebay/nice-modal-react";
import useStoreLayout from "../../../hooks/useStoreLayout";

/**
 * Mimics the EventPopover component, however, this component is a Popup (Mui Dialog).
 * This component was created because popovers don't translate too well to
 * mobile devices.
 * @returns an event details popup component
 */
const MobileEventPopup = NiceModal.create(() => {
  const modal = useModal();
  const courseType = useStoreLayout((state) => state.courseType);

  // TODO: Maybe we can modify the Popup component to promote reusability!
  return (
    <Dialog fullWidth maxWidth="xs" open={modal.visible} onClose={modal.hide}>
      <DialogContent>
        <Grid container direction="row" columnSpacing={3}>
          <Grid item xs={10} sx={{ mt: 0.5 }}>
            <EventDetails />
          </Grid>
          <Grid item xs={2}>
            <Stack direction="column" alignItems="flex-end">
              <IconButton sx={{ fontSize: "20px" }} onClick={modal.hide}>
                <CloseOutlined />
              </IconButton>
              {/* TODO: UNFINISHED FEATURE */}
              {/* {courseType === "staff" && (
                <IconButton sx={{ fontSize: "20px" }}>
                  <InfoCircleOutlined />
                </IconButton>
              )} */}
              {courseType === "staff" && <EditAction />}
              {courseType === "staff" && <DeleteAction />}
            </Stack>
          </Grid>
        </Grid>
      </DialogContent>
      {courseType === "student" && <StudentDetails />}
    </Dialog>
  );
});

export default MobileEventPopup;
