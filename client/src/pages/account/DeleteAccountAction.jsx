import Button from "@mui/material/Button";
import ConfirmPopup, { confirmDialog } from "../../components/ConfirmPopup";
import useMutationDeleteAccount from "../../hooks/useMutationDeleteAccount";

/**
 * Represents the Delete Account Button on the Profiles component
 * and the associated ConfirmPopup component.
 * @param {*} userid - for the associated user
 * @returns Delete action button and confirmation popup.
 */
function DeleteAccountAction({ userid }) {
  const { mutate } = useMutationDeleteAccount(userid);
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
