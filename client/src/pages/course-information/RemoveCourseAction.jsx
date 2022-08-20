import Button from "@mui/material/Button";
import { toast } from "react-toastify";
import ConfirmPopup, { confirmDialog } from "../../components/ConfirmPopup";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "react-query";
import { errorToast } from "../../utils/toasts";
import { leaveCourse } from "../../utils/requests";

/**
 * Represents the Trash IconButton on the CourseDetails component
 * and the associated ConfirmPopup component.
 * @param {*} courseid - for which course the user wants to leave
 * @returns Delete action button and confirmation popup.
 */
function RemoveCourseAction({ courseid }) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { mutate } = useMutation(() => leaveCourse(courseid), {
    onSuccess: () => {
      queryClient.invalidateQueries(["courses"]);
      toast.success(`Successfully removed course!`);
      navigate("/courses");
    },
    onError: (error) => {
      errorToast(error);
    },
  });
  return (
    <>
      <Button
        color="error"
        variant="contained"
        fullWidth
        sx={{ borderRadius: 0 }}
        onClick={() => {
          confirmDialog("Do you really want to remove this course?", () => {
            mutate(courseid);
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
