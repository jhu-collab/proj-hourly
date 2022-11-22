import PromoteUserForm from "./PromoteUserForm";
import NiceModal, { useModal } from "@ebay/nice-modal-react";
import Popup from "../../components/Popup";

const PromoteUser = NiceModal.create(({ params, isStaff }) => {
  const modal = useModal("promote-user");
  return (
    <>
      <Popup modal={modal} title="Promote User">
        <PromoteUserForm params={params} isStaff={isStaff} />
      </Popup>
    </>
  );
});

export default PromoteUser;
