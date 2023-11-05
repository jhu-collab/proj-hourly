import ChangeRoleForm from "./ChangeRoleForm";
import NiceModal, { useModal } from "@ebay/nice-modal-react";
import Popup from "../../components/Popup";

const ChangeRole = NiceModal.create(({ params, isStaff }) => {
  const modal = useModal("change-user-role");
  return (
    <>
      <Popup modal={modal} data-cy="change-role-button" title="Change Role">
        <ChangeRoleForm params={params} isStaff={isStaff} />
      </Popup>
    </>
  );
});

export default ChangeRole;
