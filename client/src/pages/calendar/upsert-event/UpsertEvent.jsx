import Popup from "../../../components/Popup";
import UpsertEventForm from "./UpsertEventForm";

/**
 * Parent component for the UpsertForm component.
 * @param {*} popupState (required) object that handles that state
 *                       of the popup component (object returned from
 *                       usePopupState hook from material-ui-popup-state)
 * @param {String} type String that decides when this is creating or editing
 *                      an event
 * @returns The Upsert Event popup.
 */
function UpsertEvent({ popupState, type }) {
  return (
    <Popup
      popupState={popupState}
      title={type === "edit" ? "Edit Event" : "Create Event"}
    >
      <UpsertEventForm onClose={popupState.close} type={type} />
    </Popup>
  );
}

export default UpsertEvent;
