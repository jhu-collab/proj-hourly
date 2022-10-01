import Button from "@mui/material/Button";
import { toast } from "react-toastify";
import ConfirmPopup, { confirmDialog } from "../../components/ConfirmPopup";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "react-query";
import { errorToast } from "../../utils/toasts";
import { deleteAccount } from "../../utils/requests";

/**
 * Represents the Trash IconButton on the CourseDetails component
 * and the associated ConfirmPopup component.
 * @param {*} courseid - for which course the user wants to leave
 * @returns Delete action button and confirmation popup.
 */
function DeleteAccountAction({ userid }) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { mutate } = useMutation(() => deleteAccount(userid), {
    onSuccess: () => {
      queryClient.invalidateQueries(["accounts"]);
      toast.success(`Successfully deleted account!`);
      navigate("/login");
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
          confirmDialog("Do you really want to delete your account?", () => {
            mutate(userid);
          });
        }}
      >
        Delete Account
      </Button>
      <ConfirmPopup />
    </>
  );
}

export default DeleteAccountAction;
