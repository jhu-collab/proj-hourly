import {
  Grid,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import React from "react";
import CourseList from "./CourseList";
import CoursesToggleGroup from "./CoursesToggleGroup";

function YourCourses() {
  const theme = useTheme();

  return (
    <Grid container>
      <Grid item xs={12}>
        <Stack direction="row" alignItems="center" spacing={theme.spacing(2)}>
          <Typography variant="h4">Your Courses</Typography>
          <CoursesToggleGroup />
        </Stack>
      </Grid>
      <CourseList />
    </Grid>
  );
}

export default YourCourses;
