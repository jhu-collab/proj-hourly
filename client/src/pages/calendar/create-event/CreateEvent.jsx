import Popup from "../../../components/Popup";
import CreateEventForm from "./CreateEventForm";

/**
 * Parent component for the CreateEventForm component.
 * @param {boolean} open state variable that signifies when
 *                  the popup is opened
 * @param {*} handlePopupToggle function that toggles whether the popup is open
 * @param {String} type String that decides when this is creating or editing
 *                      an event
 * @returns The Create Event popup.
 */
function CreateEvent({ open, handlePopupToggle, type }) {
  return (
    <Popup
      open={open}
      onClose={handlePopupToggle}
      title={type === "edit" ? "Edit Event" : "Create Event"}
    >
      <CreateEventForm handlePopupToggle={handlePopupToggle} type={type} />
    </Popup>
  );
}

export default CreateEvent;
