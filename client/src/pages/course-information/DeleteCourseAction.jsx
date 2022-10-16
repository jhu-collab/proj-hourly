import Button from "@mui/material/Button";
import ConfirmPopup, { confirmDialog } from "../../components/ConfirmPopup";
import useMutationDeleteCourse from "../../hooks/useMutationDeleteCourse";

/**
 * Represents the Trash IconButton on the CourseDetails component
 * and the associated ConfirmPopup component.
 * @param {*} courseId - for which course staff wants to delete
 * @returns Delete action button and confirmation popup.
 */
function DeleteCourseAction({ courseId }) {
  const { mutate } = useMutationDeleteCourse(courseId);
  return (
    <>
      <Button
        color="error"
        variant="contained"
        fullWidth
        sx={{ borderRadius: 0 }}
        onClick={() => {
          confirmDialog("Do you really want to delete this course?", () => {
            mutate();
          });
        }}
      >
        Delete Course
      </Button>
      <ConfirmPopup />
    </>
  );
}

export default DeleteCourseAction;
