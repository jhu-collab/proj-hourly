import Button from "@mui/material/Button";
import { toast } from "react-toastify";
import ConfirmPopup, { confirmDialog } from "../../components/ConfirmPopup";
import { leaveCourse } from "../../utils/requests";

/**
 * Represents the Trash IconButton on the EventDetails component
 * and the associated ConfirmPopup component.
 * @param {*} handlePopoverClose - closes EventDetails popover
 * @returns Delete action button and confirmation popup.
 */
function RemoveCourseAction({ courseid }) {
  return (
    <>
      <Button
        color="error"
        variant="contained"
        fullWidth
        sx={{ borderRadius: 0 }}
        onClick={() => {
          confirmDialog("Do you really want to remove this course?", () => {
            leaveCourse(courseid);
            toast.success(`Successfully removed course!`);
          });
        }}
      >
        Leave Course
      </Button>
      <ConfirmPopup />
    </>
  );
}

export default RemoveCourseAction;
