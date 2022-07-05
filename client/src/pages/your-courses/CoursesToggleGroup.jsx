import { ToggleButtonGroup, ToggleButton } from "@mui/material";
import React, { useState } from "react";
import useStore from "../../services/store";

function CoursesToggleGroup() {
  const { courseType, toggleCourseType } = useStore();

  const handleChange = (event, newValue) => {
    toggleCourseType(newValue);
  };

  return (
    <ToggleButtonGroup value={courseType} exclusive onChange={handleChange}>
      <ToggleButton value="student">Student</ToggleButton>
      <ToggleButton value="staff">Staff</ToggleButton>
    </ToggleButtonGroup>
  );
}

export default CoursesToggleGroup;
