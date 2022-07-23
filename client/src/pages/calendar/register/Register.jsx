import React from "react";
import Popup from "../../../components/Popup";
import RegisterForm from "./RegisterForm";

function Register({ open, handlePopupToggle }) {
  return (
    <Popup open={open} onClose={handlePopupToggle}>
      <RegisterForm handlePopupToggle={handlePopupToggle} />
    </Popup>
  );
}

export default Register;
