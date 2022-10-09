import Button from "@mui/material/Button";
import ConfirmPopup, { confirmDialog } from "../../components/ConfirmPopup";
import useMutationLeaveCourse from "../../hooks/useMutationLeaveCourse";

/**
 * Represents the Trash IconButton on the CourseDetails component
 * and the associated ConfirmPopup component.
 * @param {*} courseId - for which course the user wants to leave
 * @returns Delete action button and confirmation popup.
 */
function RemoveCourseAction({ courseId }) {
  const { mutate } = useMutationLeaveCourse(courseId);
  return (
    <>
      <Button
        color="error"
        variant="contained"
        fullWidth
        sx={{ borderRadius: 0 }}
        onClick={() => {
          confirmDialog("Do you really want to remove this course?", () => {
            mutate();
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
