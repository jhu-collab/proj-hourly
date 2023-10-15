import StudentTokenUsageForm from "./StudentTokenUsageForm";
import NiceModal, { useModal } from "@ebay/nice-modal-react";
import Popup from "../../components/Popup";

const StudentTokenUsagePopup = NiceModal.create(({ params, isStaff }) => {
  const modal = useModal("student-token-usage");
  return (
    <>
      <Popup
        modal={modal}
        data-cy="student-token-usage-button"
        title="Student Token Usage"
        width="sm"
      >
        <StudentTokenUsageForm params={params} isStaff={isStaff} />
      </Popup>
    </>
  );
});

export default StudentTokenUsagePopup;
