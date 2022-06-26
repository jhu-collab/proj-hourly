// material-ui
//import { Grid } from '@mui/material';

// project imports
import React from 'react';
import FullCalendar from '@fullcalendar/react'; // must go before plugins
import dayGridPlugin from '@fullcalendar/daygrid'; // a plugin!

import { useStore } from '../../store/appStore';
import { Paper } from '@mui/material';

// ==============================|| HOME ||============================== //

/**
 * A component that represents the landing page that the user visits after logging in.
 * @returns The Home component.
 */
const Calendar = () => {
  //const createPopup = useStore((state) => state.createPopup);
  const courses = useStore((state) => state.courses);
  console.log(courses);

  return (
    <Paper sx={{ padding: '20px', width: '100%' }}>
      <FullCalendar
        plugins={[dayGridPlugin]}
        initialView="dayGridMonth"
        handleWindowResize
      />
    </Paper>
  );
};

export default Calendar;
