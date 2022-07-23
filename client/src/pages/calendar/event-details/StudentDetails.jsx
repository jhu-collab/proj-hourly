import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import { useRegisterPopupStore } from "../../../services/store";
import Register from "../register/Register";

/**
 * Child component that displays information about an office hour
 * that is relevant for student registration.
 * @param {*} handlePopoverClose - closes the EventPopover component
 * @returns a student registration information section
 */
function StudentDetails({ handlePopoverClose }) {
  const [openPopup, setOpenPopup] = useState(false);

  const { open, togglePopup } = useRegisterPopupStore();

  const handlePopupToggle = () => {
    setOpenPopup(!open);
    togglePopup(!open);
  };

  return (
    <>
      <Stack alignItems="center" spacing={2}>
        <Typography color="red" paddingX={2}>
          You are not registered for this session
        </Typography>
        <Button
          variant="contained"
          fullWidth
          onClick={handlePopupToggle}
          sx={{ borderRadius: 0 }}
        >
          Sign Up
        </Button>
      </Stack>
      <Register
        open={openPopup}
        handlePopupToggle={handlePopupToggle}
        handlePopoverClose={handlePopoverClose}
      />
    </>
  );
}

export default StudentDetails;
