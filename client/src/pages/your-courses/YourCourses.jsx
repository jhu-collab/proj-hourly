import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Grid";
import useTheme from "@mui/material/styles/useTheme";
import { useEffect } from "react";
import CourseList from "./CourseList";
import CoursesToggleGroup from "./CoursesToggleGroup";
import CoursesSpeedDial from "./CoursesSpeedDial";
import { useCourseStore } from "../../services/store";

/**
 * Component that represents the "Your Courses" page.
 * @returns A component representing the "Your Courses" page.
 */
function YourCourses() {
  const theme = useTheme();
  const course = useCourseStore((state) => state.course);
  const setCourse = useCourseStore((state) => state.setCourse);

  useEffect(() => {
    course && setCourse();
  }, [course]);

  return (
    <>
      <Grid container>
        <Grid item xs={12}>
          <Stack direction="row" alignItems="center" spacing={theme.spacing(2)}>
            <Typography variant="h4">Your Courses</Typography>
            <CoursesToggleGroup />
          </Stack>
        </Grid>
        <CourseList />
      </Grid>
      <CoursesSpeedDial />
    </>
  );
}

export default YourCourses;
