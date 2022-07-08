import React from "react";
import Popup from "../../../components/Popup";

function CreateEvent({open, handlePopupToggle}) {
  return <Popup open={open} onClose={handlePopupToggle} title="Create Event"></Popup>;
}

export default CreateEvent;
