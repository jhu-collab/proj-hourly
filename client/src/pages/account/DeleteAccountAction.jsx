import Button from "@mui/material/Button";
import { toast } from "react-toastify";
import ConfirmPopup, { confirmDialog } from "../../components/ConfirmPopup";
import { useMutation, useQueryClient } from "react-query";
import { errorToast } from "../../utils/toasts";
import { deleteAccount } from "../../utils/requests";
import useAuth from "../../hooks/useAuth";

/**
 * Represents the Delete Account Button on the Profiles component
 * and the associated ConfirmPopup component.
 * @param {*} id - for the associated user
 * @returns Delete action button and confirmation popup.
 */
function DeleteAccountAction({ userid }) {
  const queryClient = useQueryClient();
  const { signOut } = useAuth();

  const { mutate } = useMutation(() => deleteAccount(userid), {
    onSuccess: () => {
      queryClient.invalidateQueries(["accounts"]);
      toast.success(`Successfully deleted account!`);
      signOut();
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
