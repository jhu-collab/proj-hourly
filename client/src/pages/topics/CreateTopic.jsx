import NiceModal, { useModal } from "@ebay/nice-modal-react";
import Popup from "../../components/Popup";
import CreateTopicForm from "./CreateTopicForm";

/**
 * Parent component for the CreateTopic component.
 * @returns The Create Topic popup.
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
