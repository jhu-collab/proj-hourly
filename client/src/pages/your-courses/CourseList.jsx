import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Grid from "@mui/material/Grid";
import useTheme from "@mui/material/styles/useTheme";
import React from "react";
import useStore from "../../services/store";
import CourseCard from "./CourseCard";
import { useQuery } from "react-query";
import Loader from "../../components/Loader";
import { getCourses } from "../../utils/requests";

/**
 * Represents a list of courses that a user is associated with.
 * @returns A component in which a user can see their courses.
 */
function CourseList() {
  const { courseType } = useStore();

  const theme = useTheme();

  const { isLoading, error, data } = useQuery(["courses"], getCourses);

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: theme.spacing(2) }}>
        <AlertTitle>Error</AlertTitle>
        {"An error has occurred: " + error.message}
      </Alert>
    );
  }

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
    courseType === "student"
      ? data.student
      : [...data.instructor, ...data.staff],
    courseType === "student" ? "student" : "staff member"
  );
}

export default CourseList;
