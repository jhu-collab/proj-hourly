import ChangeRoleForm from "./ChangeRoleForm";
import NiceModal, { useModal } from "@ebay/nice-modal-react";
import Popup from "../../components/Popup";

const StudentTokenUsage = NiceModal.create(({ params, isStaff }) => {
  const modal = useModal("student-token-usage");
  return (
    <>
      <Popup modal={modal} data-cy="student-token-usage-button" title="Student Token Usage">
        <ChangeRoleForm params={params} isStaff={isStaff} />
      </Popup>
    </>
  );
});

export default StudentTokenUsage;
