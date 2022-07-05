import { Box, CardActionArea, Stack, Typography, useTheme } from "@mui/material";
import React from "react";
import { Link } from "react-router-dom";
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
            <Typography variant="h5">Gateway Computing: Java</Typography>
            <Typography variant="h6">500.112</Typography>
            <Typography variant="h6">Fall 2022</Typography>
          </Stack>
        </Box>
      </CardActionArea>
    </MainCard>
  );
}

export default CourseCard;
