import React from "react";
import Popup from "../../../components/Popup";
import CreateEventForm from "./CreateEventForm";

/**
 * Parent component for the CreateEventForm component.
 * @param {boolean} open: state variable that signifies when
 *                  the popup is opened
 * @param {*} handlePopupToggle: function that toggles whether the popup is open
 * @returns The Create Event popup.
 */
function CreateEvent({ open, handlePopupToggle }) {
  return (
    <Popup open={open} onClose={handlePopupToggle} title="Create Event">
      <CreateEventForm handlePopupToggle={handlePopupToggle} />
    </Popup>
  );
}

export default CreateEvent;
