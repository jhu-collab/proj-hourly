import Box from "@mui/material/Box";
import CardActionArea from "@mui/material/CardActionArea";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import { useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import MainCard from "../../components/MainCard";
import useStoreCourse from "../../hooks/useStoreCourse";
import { eventColorPalette } from "../calendar/CalendarTheme";

/**
 * Represents a Card component that displays information about a course.
 * @param {*} course: a course object
 * @returns A course card component.
 */
function CourseCard({ course, courseType, index }) {
  const theme = useTheme();
  const navigate = useNavigate();

  const setCourse = useStoreCourse((state) => state.setCourse);

  const onClick = () => {
    setCourse(course);
    navigate("/calendar");
  };

  return (
    <MainCard
      border={false}
      borderRadius="4px"
      boxShadow
      shadow={() =>
        "0px 2px 1px -1px rgba(0, 0, 0, 0.2), 0px 1px 1px rgba(0, 0, 0, 0.14), 0px 1px 3px rgba(0, 0, 0, 0.12)"
      }
      sx={{ mt: theme.spacing(2) }}
      content={false}
    >
      <CardActionArea onClick={onClick}>
        <Box sx={{ p: theme.spacing(2) }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="flex-start"
          >
            <Stack direction="row" alignItems="center">
              <Avatar
                sx={{ bgcolor: eventColorPalette[index % 6].monthColor }}
                variant="rounded"
              >
                {course.title[0]}
              </Avatar>
              <Stack direction="column" marginLeft={1} spacing={-1}>
                <Typography fontSize="20px" fontWeight={600}>
                  {course.title}
                </Typography>
                <Typography fontSize="16px" color="text.secondary">
                  {course.courseNumber}
                </Typography>
              </Stack>
            </Stack>
            <Typography
              fontSize="16px"
              fontWeight={500}
              marginTop={0.2}
              color="rgba(30, 62, 102, 1)"
            >
              {course.semester} {course.calendarYear}
            </Typography>
          </Stack>
        </Box>
      </CardActionArea>
    </MainCard>
  );
}

export default CourseCard;
