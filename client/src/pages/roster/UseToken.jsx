import NiceModal, { useModal } from "@ebay/nice-modal-react";
import Popup from "../../components/Popup";
import UseTokenForm from "./UseTokenForm";

const UseToken = NiceModal.create(({ params, isStaff }) => {
  const modal = useModal("use-course-token");
  return (
    <>
      <Popup modal={modal} title="Use Course Token">
        <UseTokenForm params={params} isStaff={isStaff} />
      </Popup>
    </>
  );
});

export default UseToken;
