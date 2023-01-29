import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Grid from "@mui/material/Grid";
import useTheme from "@mui/material/styles/useTheme";
import CourseCard from "./CourseCard";
import useQueryCourses from "../../hooks/useQueryCourses";

/**
 * Represents a list of courses that a user is associated with.
 * @returns A component in which a user can see their courses.
 */
function CourseList({ courseType }) {
  const theme = useTheme();

  const { isLoading, error, data } = useQueryCourses();

  if (isLoading) {
    return (
      <Grid item xs={12}>
        <Alert severity="warning" sx={{ mt: theme.spacing(2) }}>
          Loading courses ...
        </Alert>
      </Grid>
    );
  }

  if (error) {
    return (
      <Grid item>
        <Alert severity="error" sx={{ mt: theme.spacing(2) }}>
          <AlertTitle>Error</AlertTitle>
          {"An error has occurred: " + error.message}
        </Alert>
      </Grid>
    );
  }

  const courseList = (courses, type) => {
    if (courses.length > 0) {
      return courses.map((course, index) => {
        return (
          <Grid item xs={12} md={4} key={index}>
            <CourseCard course={course} courseType={courseType} index={index} />
          </Grid>
        );
      });
    } else {
      return (
        <Grid item xs={12}>
          <Alert severity="info" sx={{ mt: theme.spacing(2) }}>
            You are not enrolled in any courses in which you are a {type}.
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
