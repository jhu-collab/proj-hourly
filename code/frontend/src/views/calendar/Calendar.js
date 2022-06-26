// material-ui
//import { Grid } from '@mui/material';

// project imports

import { useStore } from '../../store/appStore';

// ==============================|| HOME ||============================== //

/**
 * A component that represents the landing page that the user visits after logging in.
 * @returns The Home component.
 */
const Calendar = () => {
  //const createPopup = useStore((state) => state.createPopup);
  const courses = useStore((state) => state.courses);
  console.log(courses);

  return <>Helloooo!</>;
};

export default Calendar;
