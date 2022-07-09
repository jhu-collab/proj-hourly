import Box from "@mui/material/Box";
import CardActionArea from "@mui/material/CardActionArea";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";
import React from "react";
import MainCard from "../../components/MainCard";

/**
 * Represents a Card component that displays information about a course.
 * @param {*} course: a course object
 * @returns A course card component.
 */
function CourseCard({ course }) {
  const theme = useTheme();

  return (
    <MainCard sx={{ mt: theme.spacing(2) }} content={false}>
      <CardActionArea component="a" to="/calendar">
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
    </MainCard>
  );
}

export default CourseCard;
