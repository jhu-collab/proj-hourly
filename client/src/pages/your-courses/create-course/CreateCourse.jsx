import Popup from "../../../components/Popup";
import CreateCourseForm from "./CreateCourseForm";

/**
 * Parent component for the CreateCourseForm component.
 * @param {boolean} open: state variable that signifies when
 *                  the popup is opened
 * @param {*} handlePopupToggle: function that toggles whether the popup is open
 * @returns The Create Course popup.
 */
function CreateCourse({ open, handlePopupToggle }) {
  return (
    <Popup open={open} onClose={handlePopupToggle} title="Create Course">
      <CreateCourseForm handlePopupToggle={handlePopupToggle} />
    </Popup>
  );
}

export default CreateCourse;
