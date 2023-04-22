import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import useTheme from "@mui/material/styles/useTheme";
import { useEffect } from "react";
import CourseList from "./CourseList";
import AddCourseButton from "./AddCourseButton";
import useStoreCourse from "../../hooks/useStoreCourse";

/**
 * Component that represents the "My Courses" page.
 * @returns A component representing the "Your Courses" page.
 */
function MyCourses() {
  const theme = useTheme();

  const course = useStoreCourse((state) => state.course);
  const setCourse = useStoreCourse((state) => state.setCourse);

  useEffect(() => {
    course && setCourse();
  }, [course]);

  return (
    <>
      <Typography fontWeight={500} fontSize="23px">
        Staff Courses
      </Typography>
      <Grid
        container
        columnSpacing={6}
        rowSpacing={3}
        marginBottom={2}
        data-cy="staff-course-list"
      >
        <CourseList courseType="staff" />
      </Grid>
      <Typography fontWeight={500} fontSize="23px">
        Student Courses
      </Typography>
      <Grid
        container
        columnSpacing={6}
        rowSpacing={3}
        marginBottom={2}
        data-cy="student-course-list"
      >
        <CourseList courseType="student" />
      </Grid>
      <AddCourseButton />
    </>
  );
}

export default MyCourses;
