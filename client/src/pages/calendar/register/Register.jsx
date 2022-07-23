import React from "react";
import Popup from "../../../components/Popup";
import RegisterForm from "./RegisterForm";

function Register({ open, handlePopupToggle, handlePopoverClose }) {
  return (
    <Popup open={open} onClose={handlePopupToggle}>
      <RegisterForm
        handlePopupToggle={handlePopupToggle}
        handlePopoverClose={handlePopoverClose}
      />
    </Popup>
  );
}

export default Register;
