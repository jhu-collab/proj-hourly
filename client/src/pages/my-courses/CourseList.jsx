import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Grid from "@mui/material/Grid";
import useTheme from "@mui/material/styles/useTheme";
import CourseCard from "./CourseCard";
import useQueryCourses from "../../hooks/useQueryCourses";
import useStoreLayout from "../../hooks/useStoreLayout";

/**
 * Represents a list of courses that a user is associated with.
 * @returns A component in which a user can see their courses.
 */
function CourseList() {
  const courseType = useStoreLayout((state) => state.courseType);

  const theme = useTheme();

  const { isLoading, error, data } = useQueryCourses();

  if (isLoading) {
    return (
      <Alert severity="warning" sx={{ mt: theme.spacing(2) }}>
        <AlertTitle>Loading courses ...</AlertTitle>
      </Alert>
    );
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
          <Grid item xs={12} key={index}>
            <CourseCard course={course} courseType={courseType} />
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
