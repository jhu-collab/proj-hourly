import { ToggleButtonGroup, ToggleButton } from "@mui/material";
import React, { useState } from "react";

function CoursesToggleGroup() {
  const [alignment, setAlignment] = useState('student');

  const handleAlignment = (event, newAlignment) => {
    setAlignment(newAlignment);
  };

  return (
    <ToggleButtonGroup value={alignment} exclusive onChange={handleAlignment}>
      <ToggleButton value="student">Student</ToggleButton>
      <ToggleButton value="staff">Staff</ToggleButton>
    </ToggleButtonGroup>
  );
}

export default CoursesToggleGroup;
