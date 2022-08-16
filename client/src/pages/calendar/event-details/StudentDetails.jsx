import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import NiceModal from "@ebay/nice-modal-react";

/**
 * Child component that displays information about an office hour
 * that is relevant for student registration.
 * @returns a student registration information section
 */
function StudentDetails() {
  return (
    <>
      <Stack alignItems="center" spacing={2}>
        <Typography color="red" paddingX={2}>
          You are not registered for this session
        </Typography>
        <Button
          variant="contained"
          fullWidth
          onClick={() => NiceModal.show("register-event")}
          sx={{ borderRadius: 0 }}
        >
          Sign Up
        </Button>
      </Stack>
    </>
  );
}

export default StudentDetails;
