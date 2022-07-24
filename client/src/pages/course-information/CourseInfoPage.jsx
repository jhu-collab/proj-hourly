import MainCard from '../../components/MainCard';
import Typography  from '@mui/material/Typography';
import Grid  from '@mui/material/Grid';
import Button  from '@mui/material/Button';
import {useState}  from 'react';
import RemoveCourseAction from './RemoveCourseAction';
import useStore from '../../services/store';
function CourseInfoPage () {
  const courseName = 'Data Structures';
  const courseNumber = '601.226';
  const semester = 'Fall';
  const year = '2022';
  const [open, setOpen] = useState(false);
  const {
    currentCourse,
  } = useStore();
  const handleLeaveCourse = () => {
    setOpen(true);
  };

  const handleConfirm = () => {
    //route to leave
    setOpen(false);
  };

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
          {courseName}
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
          {courseNumber}
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
          {semester}
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
          {year}
        </Typography>
      </Grid>
      <Grid item>
      </Grid>
      <RemoveCourseAction courseid={currentCourse.id}/>
    </MainCard>
  );
};

export default CourseInfoPage;