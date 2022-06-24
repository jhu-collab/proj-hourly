// material-ui
import { Grid } from '@mui/material';

// project imports
import CourseCard from './CourseCard';
import courseData from './course-data/course-data';

// ==============================|| HOME ||============================== //

const Home = () => (
  <Grid container rowSpacing={1}>
    {courseData.map((course, index) => {
      return (
        <Grid item xs={12}>
          <CourseCard
            title={course.title}
            number={course.courseNumber}
            semester={course.semester}
            year={course.calendarYear}
          />
        </Grid>
      );
    })}
  </Grid>
);

export default Home;
