import Popup from "../../../components/Popup";
import JoinCourseForm from "./JoinCourseForm";
import NiceModal, { useModal } from "@ebay/nice-modal-react";

/**
 * Parent component for the JoinCourseForm component.
 * @returns The Join Course popup. */
const JoinCourse = NiceModal.create(() => {
  const modal = useModal();
  return (
    <Popup modal={modal}>
      <JoinCourseForm onClose={modal.hide} />
    </Popup>
  );
});

export default JoinCourse;
