import {
  Grid,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import React from "react";
import CourseList from "./CourseList";
import CoursesToggleGroup from "./CoursesToggleGroup";
import { DashboardFilled } from "@ant-design/icons";
import CoursesSpeedDial from "./CoursesSpeedDial";

const actions = [
  { icon: <DashboardFilled />, name: "Copy" },
  { icon: <DashboardFilled />, name: "Save" },
  { icon: <DashboardFilled />, name: "Print" },
  { icon: <DashboardFilled />, name: "Share" },
];

/**
 * Component that represents the "Your Courses" page.
 * @returns A component representing the "Your Courses" page.
 */
function YourCourses() {
  const theme = useTheme();

  return (
    <>
      <Grid container>
        <Grid item xs={12}>
          <Stack direction="row" alignItems="center" spacing={theme.spacing(2)}>
            <Typography variant="h4">Your Courses</Typography>
            <CoursesToggleGroup />
          </Stack>
        </Grid>
        <CourseList />
      </Grid>
      <CoursesSpeedDial />
    </>
  );
}

export default YourCourses;
