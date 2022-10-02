import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import ToggleButton from "@mui/material/ToggleButton";

/**
 * Represents a Material UI ToggleButtonGroup component that handles
 * the switch between student and staff courses.
 * @returns A component can select between student and staff courses.
 */
function CoursesToggleGroup() {
  const courseType = useStoreLayout((state) => state.courseType);
  const toggleCourseType = useStoreLayout((state) => state.toggleCourseType);

  const handleChange = (event, newValue) => {
    if (newValue != null) {
      toggleCourseType(newValue);
    }
  };

  return (
    <ToggleButtonGroup value={courseType} exclusive onChange={handleChange}>
      <ToggleButton value="student">Student</ToggleButton>
      <ToggleButton value="staff">Staff</ToggleButton>
    </ToggleButtonGroup>
  );
}

export default CoursesToggleGroup;
