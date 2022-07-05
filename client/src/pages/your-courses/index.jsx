import {
  Grid,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useTheme,
} from "@mui/material";
import React from "react";
import MainCard from "../../components/MainCard";
import useStore from "../../services/store";
import CourseCard from "./CourseCard";
import { staffCourses, studentCourses } from "./courses-data";
import CoursesToggleGroup from "./CoursesToggleGroup";

function YourCourses() {
  const theme = useTheme();

  const { courseType } = useStore();

  const courseList = (courses) => {
    return courses.map((course, index) => {
      return (
        <Grid item xs={12}>
          <CourseCard course={course} />
        </Grid>
      );
    });
  };

  return (
    <Grid rowSpacing={4.5} columnSpacing={2.75}>
      <Grid item xs={12}>
        <Stack direction="row" alignItems="center" spacing={theme.spacing(2)}>
          <Typography variant="h4">Your Courses</Typography>
          <CoursesToggleGroup />
        </Stack>
      </Grid>
      {courseType === "student"
        ? courseList(studentCourses)
        : courseList(staffCourses)}
    </Grid>
  );
}

export default YourCourses;
