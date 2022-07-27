import Popup from "../../../components/Popup";
import RegisterForm from "./RegisterForm";

/**
 * Parent component for the RegisterForm component.
 * @param {boolean} open state variable that signifies when
 *                  the popup is opened
 * @param {*} handlePopupToggle function that toggles whether the popup is open
 * @param {*} handlePopoverClose function that closes the EventPopover
 * @returns The Register popup.
 */
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
