import MainCard from "../../components/MainCard";
import Typography from "@mui/material/Typography";
import RemoveCourseAction from "./RemoveCourseAction";
import { useCourseStore, useLayoutStore } from "../../services/store";
import Stack from "@mui/material/Stack";

function CourseInfoPage() {
  const course = useCourseStore((state) => state.course);
  const courseType = useLayoutStore((state) => state.courseType);
  return (
    <MainCard title="Course Information" sx={{ padding: 0 }} content={false}>
      <Stack padding="16px" spacing={1}>
        <Typography variant="h5" fontWeight={400}>
          Course Name: <strong>{course.title}</strong>
        </Typography>
        <Typography variant="h5" fontWeight={400}>
          Course Number: <strong>{course.courseNumber}</strong>
        </Typography>
        <Typography variant="h5" fontWeight={400}>
          Semester: <strong>{course.semester}</strong>
        </Typography>
        <Typography variant="h5" fontWeight={400}>
          Year: <strong>{course.calendarYear}</strong>
        </Typography>
        {courseType === "staff" && (
          <Typography variant="h5" fontWeight={400}>
            Code: <strong>{course.code}</strong>
          </Typography>
        )}
      </Stack>
      {courseType === "student" && <RemoveCourseAction courseid={course.id} />}
    </MainCard>
  );
}

export default CourseInfoPage;
