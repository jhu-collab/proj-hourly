import Box from "@mui/material/Box";
import CardActionArea from "@mui/material/CardActionArea";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import MainCard from "../../components/MainCard";
import { useCourseStore } from "../../services/store";
import { IconButton } from "@mui/material";
import ConfirmPopup, { confirmDialog } from "../../components/ConfirmPopup";
import CloseOutlined from "@ant-design/icons/CloseOutlined";
/**
 * Represents a Card component that displays information about a course.
 * @param {*} course: a course object
 * @returns A course card component.
 */
function CourseCard({ course, courseType }) {
  const theme = useTheme();
  const navigate = useNavigate();

  const setCourse = useCourseStore((state) => state.setCourse);

  const onClick = () => {
    setCourse(course);
    navigate("/calendar");
  };

  const leaveCourse = () => {
    //TODO implement the backend aspect
  };

  return (
    <MainCard sx={{ mt: theme.spacing(2) }} content={false}>
      <Stack direction={"row"}>
        <CardActionArea onClick={onClick}>
          <Box sx={{ p: theme.spacing(3) }}>
            <Stack direction="column">
              <Typography variant="h5">{course.title}</Typography>
              <Typography variant="h6">{course.courseNumber}</Typography>
              <Typography variant="h6">
                {course.semester} {course.calendarYear}
              </Typography>
            </Stack>
          </Box>
        </CardActionArea>
        {courseType == "student" ? (
          <>
            <IconButton
              sx={{ margin: 0, fontSize: 17}}
              onClick={() => {
                confirmDialog("Do you want to leave this course?", leaveCourse);
              }}
            >
              {" "}
              <CloseOutlined />{" "}
            </IconButton>{" "}
            <ConfirmPopup />
          </>
        ) : (
          <></>
        )}
      </Stack>
    </MainCard>
  );
}

export default CourseCard;
