import Popup from "../../../components/Popup";
import CreateCourseForm from "./CreateCourseForm";

function CreateCourse({ open, handlePopupToggle }) {
  return (
    <Popup open={open} onClose={handlePopupToggle} title="Create Course">
        <CreateCourseForm />
    </Popup>
  );
}

export default CreateCourse;
