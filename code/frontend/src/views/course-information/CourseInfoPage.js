import MainCard from 'ui-component/cards/MainCard';
import { Typography, Grid } from '@mui/material';
import { Button } from '@mui/material';
import { useState } from 'react';
import ConfirmActionDialog from './ConfirmActionDialog';
const CourseInfoPage = () => {
  const courseName = 'Data Structures';
  const courseNumber = '601.226';
  const semester = 'Fall';
  const year = '2022';
  const [open, setOpen] = useState(false);
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
        <Button
          variant="contained"
          color="secondary"
          onClick={handleLeaveCourse}
        >
          Leave Course
        </Button>
      </Grid>
      <ConfirmActionDialog
        open={open}
        setOpen={setOpen}
        dialogTitle="You are about to leave the course"
        dialogActionText="Confirm"
        handleAction={handleConfirm}
      />
    </MainCard>
  );
};

export default CourseInfoPage;
