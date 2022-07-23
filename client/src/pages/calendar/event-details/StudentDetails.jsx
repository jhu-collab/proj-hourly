import { Button, Stack, Typography } from "@mui/material";
import { useState } from "react";
import { useRegisterPopupStore } from "../../../services/store";
import Register from "../register/Register";

function StudentDetails() {
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
        <Button variant="contained" fullWidth onClick={handlePopupToggle}>
          Sign Up
        </Button>
      </Stack>
      <Register open={openPopup} handlePopupToggle={handlePopupToggle} />
    </>
  );
}

export default StudentDetails;
