import { Alert, AlertTitle, Grid, useTheme } from "@mui/material";
import React from "react";
import useStore from "../../services/store";
import CourseCard from "./CourseCard";
import { staffCourses, studentCourses } from "./courses-data";

/**
 * Represents a list of courses that a user is associated with.
 * @returns A component in which a user can see their courses.
 */
function CourseList() {
  const { courseType } = useStore();

  const theme = useTheme();

  const courseList = (courses, type) => {
    if (courses.length > 0) {
      return courses.map((course, index) => {
        return (
          <Grid item xs={12}>
            <CourseCard course={course} />
          </Grid>
        );
      });
    } else {
      return (
        <Grid item xs={12}>
          <Alert severity="info" sx={{ mt: theme.spacing(2) }}>
            <AlertTitle>
              You are not enrolled in any courses in which you are a {type}.
            </AlertTitle>
          </Alert>
        </Grid>
      );
    }
  };

  return courseList(
    courseType === "student" ? studentCourses : staffCourses,
    courseType === "student" ? "student" : "staff member"
  );
}

export default CourseList;
