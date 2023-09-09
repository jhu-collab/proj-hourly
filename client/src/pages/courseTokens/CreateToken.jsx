import NiceModal, { useModal } from "@ebay/nice-modal-react";
import Popup from "../../components/Popup";
import CreateTokenForm from "./CreateTokenForm";
/**
 * Parent component for the CreateTopic component.
 * @returns The Create Topic popup.
 */
const CreateTopic = NiceModal.create(() => {
  const modal = useModal("create-token");

  return (
    <Popup modal={modal} title="Create Token">
      <CreateTokenForm />
    </Popup>
  );
});

export default CreateTopic;
