import InviteUserForm from "./InviteUserForm";
import NiceModal, { useModal } from "@ebay/nice-modal-react";
import Popup from "../../components/Popup";

/**
 * Parent component for the InviteUserForm component.
 * @param {*} isInstructor boolean that represents whether
 *                         user is an instructor
 * @returns The Invite User popup.
 */
const InviteUser = NiceModal.create(({ isInstructor }) => {
  const modal = useModal("invite-user");
  return (
    <>
      <Popup modal={modal} title="Invite User">
        <InviteUserForm isInstructor={isInstructor} />
      </Popup>
    </>
  );
});

export default InviteUser;
