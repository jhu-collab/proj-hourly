import NiceModal, { useModal } from "@ebay/nice-modal-react";
import Popup from "../../components/Popup";
import CreateTopicForm from "./CreateTopicForm";

/**
 * Parent component for the CreateRegistrationTypeForm component.t
 * @returns The Create Registration Type popup.
 */
const CreateTopic = NiceModal.create(() => {
  const modal = useModal("create-topic");

  return (
    <Popup modal={modal} title="Create Topic">
      <CreateTopicForm />
    </Popup>
  );
});

export default CreateTopic;
