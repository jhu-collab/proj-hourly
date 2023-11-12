import MainCard from "../../components/MainCard";
import Typography from "@mui/material/Typography";
import RemoveCourseAction from "./RemoveCourseAction";
import DeleteCourseAction from "./DeleteCourseAction";
import Stack from "@mui/material/Stack";
import useStoreCourse from "../../hooks/useStoreCourse";
import useStoreLayout from "../../hooks/useStoreLayout";
import CourseCalendarEventForm from "./CourseCalendarEventForm";
import CourseTokenOptInForm from "./CourseTokenOptInForm";
import CourseRegistrationConstraintForm from "./CourseRegistrationConstraintForm";

function CourseInfoPage() {
  const course = useStoreCourse((state) => state.course);
  const courseType = useStoreLayout((state) => state.courseType);
  return (
    <>
      <MainCard title="Course Information" sx={{ padding: 0 }} content={false}>
        <Stack padding="16px" spacing={1}>
          <Typography
            data-cy="course-details-title"
            variant="h5"
            fontWeight={400}
          >
            Course Name: <strong>{course.title}</strong>
          </Typography>
          <Typography
            data-cy="course-details-number"
            variant="h5"
            fontWeight={400}
          >
            Course Number: <strong>{course.courseNumber}</strong>
          </Typography>
          <Typography
            data-cy="course-details-semester"
            variant="h5"
            fontWeight={400}
          >
            Semester: <strong>{course.semester}</strong>
          </Typography>
          <Typography
            data-cy="course-details-year"
            variant="h5"
            fontWeight={400}
          >
            Year: <strong>{course.calendarYear}</strong>
          </Typography>
          {(courseType === "Staff" || courseType === "Instructor") && (
            <Typography
              data-cy="course-details-code"
              variant="h5"
              fontWeight={400}
            >
              Code: <strong>{course.code}</strong>
            </Typography>
          )}
        </Stack>
        {courseType === "Student" && (
          <RemoveCourseAction courseId={course.id} />
        )}
        {courseType === "Instructor" && (
          <DeleteCourseAction courseId={course.id} />
        )}
      </MainCard>

      {courseType === "Instructor" && (
        <MainCard
          data-cy="coursetype-calendar-event_info_title"
          title="Course Calendar Event Information"
          sx={{ padding: 0 }}
          content={true}
        >
          <CourseCalendarEventForm data-cy="form" />
        </MainCard>
      )}
      {courseType === "Instructor" && ( // newly added
        <MainCard
          data-cy="course-registration-constraint_form_title"
          title="Course Registration Constraints"
          sx={{ padding: 0 }}
          content={true}
        >
          <CourseRegistrationConstraintForm data-cy="form" />
        </MainCard>
      )}
      {courseType === "Instructor" && (
        <MainCard
          data-cy="coursetype-course-token-title"
          title="Course Token Option"
          sx={{ padding: 0 }}
          content={true}
        >
          <CourseTokenOptInForm />
        </MainCard>
      )}
    </>
  );
}

export default CourseInfoPage;
