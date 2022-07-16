import React from "react";
import Popup from "./Popup";

function ConfirmActionDialog({ open, onClose }) {
  return <Popup open={open} onClose={onClose}></Popup>;
}

export default ConfirmActionDialog;
