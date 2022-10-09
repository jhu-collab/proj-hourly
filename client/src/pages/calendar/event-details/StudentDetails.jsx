import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import NiceModal from "@ebay/nice-modal-react";
import Alert from "@mui/material/Alert";
import ConfirmPopup, { confirmDialog } from "../../../components/ConfirmPopup";
import useQueryRegistrationStatus from "../../../hooks/useQueryRegistrationStatus";
import useMutationCancelRegistration from "../../../hooks/useMutationCancelRegistration";

/**
 * Child component that displays information about an office hour
 * that is relevant for student registration.
 * @returns a student registration information section
 */
function StudentDetails() {
  const { isLoading, error, data } = useQueryRegistrationStatus();

  const { mutate, isLoading: isLoadingMutate } = useMutationCancelRegistration(
    data?.registration?.id || -1
  );

  if (isLoading) {
    return <Alert severity="warning">Retrieving registration status ...</Alert>;
  }

  if (error) {
    return (
      <Alert severity="error">Unable to retrieve registration status</Alert>
    );
  }

  const isRegistered = data.status === "Registered";

  const onClick = () => {
    isRegistered
      ? confirmDialog("Do you really want to cancel this registration?", () =>
          mutate()
        )
      : NiceModal.show("register-event");
  };

  return (
    <>
      <Stack alignItems="center" spacing={2}>
        <Typography color={isRegistered ? "green" : "red"} paddingX={2}>
          {isRegistered
            ? `You are currently registered for this session`
            : `You are not registered for this session`}
        </Typography>
        <Button
          variant="contained"
          fullWidth
          sx={{ borderRadius: 0 }}
          color={isRegistered ? "error" : "primary"}
          onClick={onClick}
        >
          {isRegistered ? `Cancel` : `Sign Up`}
        </Button>
      </Stack>
      <ConfirmPopup />
    </>
  );
}

export default StudentDetails;
