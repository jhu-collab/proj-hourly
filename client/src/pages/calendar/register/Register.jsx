import Popup from "../../../components/Popup";
import RegisterForm from "./RegisterForm";
import NiceModal, { useModal } from "@ebay/nice-modal-react";

/**
 * Parent component for the RegisterForm component.
 * @returns The Register popup.
 */
const Register = NiceModal.create(() => {
  const modal = useModal("register-event");
  return (
    <Popup modal={modal}>
      <RegisterForm />
    </Popup>
  );
});

export default Register;
