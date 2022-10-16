import NiceModal, { useModal } from "@ebay/nice-modal-react";
import Popup from "../../components/Popup";

/**
 * Parent component for the RegisterForm component.
 * @returns The Register popup.
 */
const CreateRegistrationType = NiceModal.create(() => {
  const modal = useModal("create-registration-type");
  return <Popup modal={modal}></Popup>;
});

export default CreateRegistrationType;
