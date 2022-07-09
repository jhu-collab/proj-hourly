import React from "react";
import Popup from "../../../components/Popup";
import JoinCourseForm from "./JoinCourseForm";

function JoinCourse({ open, handlePopupToggle }) {
  return (
    <Popup open={open} onClose={handlePopupToggle} title="Join Course">
      <JoinCourseForm onClose={handlePopupToggle} />
    </Popup>
  );
}

export default JoinCourse;
