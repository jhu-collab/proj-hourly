import MainCard from '../../components/MainCard';
import Typography  from '@mui/material/Typography';
import Grid  from '@mui/material/Grid';
import {useState}  from 'react';
import RemoveCourseAction from './RemoveCourseAction';
import { useCourseStore } from '../../services/store';
function CourseInfoPage () {
  const course = useCourseStore((state) => state.course);
  return (
    <MainCard title="Course Information">
      <Grid item>
        <Typography
          display="inline"
          variant="h4"
          style={{ fontWeight: 'lighter' }}
        >
          {'Course Name: '}
        </Typography>
        <Typography
          display="inline"
          variant="h4"
          style={{ fontWeight: 'bold' }}
        >
          {course.title}
        </Typography>
      </Grid>
      <Grid item>
        <Typography
          display="inline"
          variant="h4"
          style={{ fontWeight: 'lighter' }}
        >
          {'Course Number: '}
        </Typography>
        <Typography
          display="inline"
          variant="h4"
          style={{ fontWeight: 'bold' }}
        >
          {course.courseNumber}
        </Typography>
      </Grid>
      <Grid item>
        <Typography
          display="inline"
          variant="h4"
          style={{ fontWeight: 'lighter' }}
        >
          {'Semester : '}
        </Typography>
        <Typography
          display="inline"
          variant="h4"
          style={{ fontWeight: 'bold' }}
        >
          {course.semester}
        </Typography>
      </Grid>
      <Grid item>
        <Typography
          display="inline"
          variant="h4"
          style={{ fontWeight: 'lighter' }}
        >
          {'Year: '}
        </Typography>
        <Typography
          display="inline"
          variant="h4"
          style={{ fontWeight: 'bold' }}
        >
          {course.calendarYear}
        </Typography>
      </Grid>
      <Grid item>
      </Grid>
      <RemoveCourseAction courseid={course.id}/>
    </MainCard>
  );
};

export default CourseInfoPage;