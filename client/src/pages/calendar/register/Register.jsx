import Popup from "../../../components/Popup";
import RegisterForm from "./RegisterForm";

/**
 * Parent component for the RegisterForm component.
 * @param {*} popupState (required) object that handles that state
 *                       of the popup component (object returned from
 *                       usePopupState hook from material-ui-popup-state)
 * @param {*} handlePopoverClose function that closes the EventPopover
 * @returns The Register popup.
 */
function Register({ popupState, handlePopoverClose }) {
  return (
    <Popup popupState={popupState}>
      <RegisterForm
        closePopup={popupState.close}
        closePopover={handlePopoverClose}
      />
    </Popup>
  );
}

export default Register;
