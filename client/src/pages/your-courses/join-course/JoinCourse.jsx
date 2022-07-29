import Popup from "../../../components/Popup";
import JoinCourseForm from "./JoinCourseForm";

/**
 * Parent component for the JoinCourseForm component.
 * @param {*} popupState (required) object that handles that state
 *                       of the popup component (object returned from
 *                       usePopupState hook from material-ui-popup-state)
 * @returns The Join Course popup. */
function JoinCourse({ popupState }) {
  return (
    <Popup popupState={popupState} title="Join Course">
      <JoinCourseForm onClose={popupState.close} />
    </Popup>
  );
}

export default JoinCourse;
