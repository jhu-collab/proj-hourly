import NiceModal, { useModal } from "@ebay/nice-modal-react";
import Popup from "../../components/Popup";
import GiveFeedback from "./GiveFeedback";

/**
 * Parent component for the CreateRegistrationTypeForm component.t
 * @returns The Create Registration Type popup.
 */
const CreateRegistrationFeedback = NiceModal.create(() => {
  const modal = useModal("create-feedback");
  return (
    <Popup modal={modal} title="Feedback">
      <GiveFeedback registrationId={modal.args.registrationId} />
    </Popup>
  );
});

export default CreateRegistrationFeedback;
