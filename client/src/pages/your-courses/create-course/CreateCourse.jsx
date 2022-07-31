import Popup from "../../../components/Popup";
import CreateCourseForm from "./CreateCourseForm";
import NiceModal, { useModal } from "@ebay/nice-modal-react";

/**
 * Parent component for the CreateCourseForm component.
 * @returns The Create Course popup.
 */
const CreateCourse = NiceModal.create(() => {
  const modal = useModal();
  return (
    <Popup modal={modal} title="Create Course">
      <CreateCourseForm />
    </Popup>
  );
});

export default CreateCourse;
