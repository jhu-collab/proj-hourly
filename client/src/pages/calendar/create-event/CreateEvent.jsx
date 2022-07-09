import React from "react";
import Popup from "../../../components/Popup";
import CreateEventForm from "./CreateEventForm";

function CreateEvent({ open, handlePopupToggle }) {
  return (
    <Popup open={open} onClose={handlePopupToggle} title="Create Event">
      <CreateEventForm handlePopupToggle={handlePopupToggle} />
    </Popup>
  );
}

export default CreateEvent;
