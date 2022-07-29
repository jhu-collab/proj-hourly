import Popup from "../../../components/Popup";
import CreateCourseForm from "./CreateCourseForm";

/**
 * Parent component for the CreateCourseForm component.
 * @param {*} popupState (required) object that handles that state
 *                       of the popup component (object returned from
 *                       usePopupState hook from material-ui-popup-state)
 * @returns The Create Course popup.
 */
function CreateCourse({ popupState }) {
  return (
    <Popup popupState={popupState} title="Create Course">
      <CreateCourseForm onClose={popupState.close} />
    </Popup>
  );
}

export default CreateCourse;
