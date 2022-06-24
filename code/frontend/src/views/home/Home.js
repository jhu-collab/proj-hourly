// material-ui
import { Grid, Typography } from '@mui/material';

// project imports
import CourseCard from './CourseCard';
import courseData from './course-data/course-data';
import ExpandFab from './ExpandFab';
import { useStore } from '../../store/appStore';
import CreateCourse from 'views/create-course/CreateCourse';

// ==============================|| HOME ||============================== //

const Home = () => {
  const createPopup = useStore((state) => state.createPopup);

  return (
    <>
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
      <ExpandFab />
      {createPopup && (<CreateCourse />)}
    </>
  );
};

export default Home;
