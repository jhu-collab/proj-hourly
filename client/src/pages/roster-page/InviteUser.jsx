import InviteUserForm from "./InviteUserForm";
import NiceModal, { useModal } from "@ebay/nice-modal-react";
import Popup from "../../components/Popup";

/**
 * Represents a Material UI Card component that allows staff to add users.
 * @param {*} props - Properties include onClose, open, id, token.
 * @returns A card for adding user.
 */
const InviteUser = NiceModal.create(({ isInstructor }) => {
  const modal = useModal();
  return (
    <>
      <Popup modal={modal} title="Invite User">
        <InviteUserForm isInstructor={isInstructor} />
      </Popup>
    </>
  );
});

export default InviteUser;
