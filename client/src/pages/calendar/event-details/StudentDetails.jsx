import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import NiceModal from "@ebay/nice-modal-react";
import Alert from "@mui/material/Alert";
import { useQuery } from "react-query";
import { getRegistrationStatus } from "../../../utils/requests";

/**
 * Child component that displays information about an office hour
 * that is relevant for student registration.
 * @returns a student registration information section
 */
function StudentDetails() {
  const { isLoading, error, data } = useQuery(
    ["registrationStatus"],
    getRegistrationStatus
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
          {...(!isRegistered && {
            onClick: () => NiceModal.show("register-event"),
          })}
        >
          {isRegistered ? `Cancel` : `Sign Up`}
        </Button>
      </Stack>
    </>
  );
}

export default StudentDetails;
