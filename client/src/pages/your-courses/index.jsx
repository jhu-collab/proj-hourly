import {
  Grid,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useTheme,
} from "@mui/material";
import React from "react";
import CoursesToggleGroup from "./CoursesToggleGroup";

function YourCourses() {
  const theme = useTheme();

  return (
    <Grid rowSpacing={4.5} columnSpacing={2.75}>
      <Grid item xs={12} sx={{ mb: -2.25 }}>
        <Stack direction="row" alignItems="center" spacing={theme.spacing(2)}>
          <Typography variant="h4">Your Courses</Typography>
          <CoursesToggleGroup />
        </Stack>
      </Grid>
    </Grid>
  );
}

export default YourCourses;
