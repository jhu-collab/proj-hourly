// material-ui
import { Grid } from '@mui/material';

// project imports
import CourseCard from './CourseCard';
import ExpandFab from './ExpandFab';
import { useStore } from '../../store/appStore';
import CreateCourse from 'views/create-course/CreateCourse';

// ==============================|| HOME ||============================== //

/**
 * A component that represents the landing page that the user visits after logging in.
 * @returns The Home component.
 */
const Home = () => {
  const createCoursePopup = useStore((state) => state.createCoursePopup);
  const courses = useStore((state) => state.courses);
  console.log(courses);

  return (
    <>
      <Grid container rowSpacing={1}>
        {courses.map((course, index) => {
          return (
            <Grid item xs={12}>
              <CourseCard
                title={course.title}
                number={course.number}
                semester={course.semester}
                year={course.year}
              />
            </Grid>
          );
        })}
      </Grid>
      <ExpandFab />
      {createCoursePopup && <CreateCourse />}
    </>
  );
};

export default Home;
