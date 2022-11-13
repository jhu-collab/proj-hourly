import PromoteUserForm from "./PromoteUserForm";
import NiceModal, { useModal } from "@ebay/nice-modal-react";
import Popup from "../../components/Popup";

/**
 * Parent component for the PromoteUserForm component.
 * @param {*} isInstructor boolean that represents whether
 *                         user is an instructor
 * @returns The Invite User popup.
 */
const PromoteUser = NiceModal.create(({ isInstructor }) => {
  const modal = useModal("promote-user");
  return (
    <>
      <Popup modal={modal} title="Promote Student to Staff">
        <PromoteUserForm isInstructor={isInstructor} />
      </Popup>
    </>
  );
});

export default PromoteUser;
