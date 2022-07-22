import Popup from "../../../components/Popup";
import UpsertEventForm from "./UpsertEventForm";

/**
 * Parent component for the UpsertForm component.
 * @param {boolean} open state variable that signifies when
 *                  the popup is opened
 * @param {*} handlePopupToggle function that toggles whether the popup is open
 * @param {String} type String that decides when this is creating or editing
 *                      an event
 * @returns The Upsert Event popup.
 */
function UpsertEvent({ open, handlePopupToggle, type }) {
  return (
    <Popup
      open={open}
      onClose={handlePopupToggle}
      title={type === "edit" ? "Edit Event" : "Create Event"}
    >
      <UpsertEventForm handlePopupToggle={handlePopupToggle} type={type} />
    </Popup>
  );
}

export default UpsertEvent;
