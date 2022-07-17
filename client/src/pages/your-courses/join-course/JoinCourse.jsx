import Popup from "../../../components/Popup";
import JoinCourseForm from "./JoinCourseForm";

/**
 * Parent component for the JoinCourseForm component.
 * @param {boolean} open: state variable that signifies when
 *                  the popup is opened
 * @param {*} handlePopupToggle: function that toggles whether the popup is open
 * @returns The Join Course popup. */
function JoinCourse({ open, handlePopupToggle }) {
  return (
    <Popup open={open} onClose={handlePopupToggle} title="Join Course">
      <JoinCourseForm onClose={handlePopupToggle} />
    </Popup>
  );
}

export default JoinCourse;
