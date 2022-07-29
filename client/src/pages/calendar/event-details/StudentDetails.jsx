import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Register from "../register/Register";
import { usePopupState } from "material-ui-popup-state/hooks";

/**
 * Child component that displays information about an office hour
 * that is relevant for student registration.
 * @param {*} onClose - closes the EventPopover component
 * @returns a student registration information section
 */
function StudentDetails({ onClose }) {
  const registerPopupState = usePopupState({
    variant: "dialog",
    popupId: "register",
  });

  return (
    <>
      <Stack alignItems="center" spacing={2}>
        <Typography color="red" paddingX={2}>
          You are not registered for this session
        </Typography>
        <Button
          variant="contained"
          fullWidth
          onClick={registerPopupState.open}
          sx={{ borderRadius: 0 }}
        >
          Sign Up
        </Button>
      </Stack>
      <Register popupState={registerPopupState} handlePopoverClose={onClose} />
    </>
  );
}

export default StudentDetails;
