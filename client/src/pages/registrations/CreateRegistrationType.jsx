import NiceModal, { useModal } from "@ebay/nice-modal-react";
import Popup from "../../components/Popup";
import CreateRegistrationTypeForm from "./CreateRegistrationTypeForm";

const CreateRegistrationType = NiceModal.create(() => {
  const modal = useModal("create-registration-type");

  return (
    <Popup modal={modal} title="Create Registration Type">
      <CreateRegistrationTypeForm />
    </Popup>
  );
});

export default CreateRegistrationType;
