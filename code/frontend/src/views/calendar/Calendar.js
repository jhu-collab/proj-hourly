import React from 'react';

// material-ui
import { Paper } from '@mui/material';

// full calendar
import FullCalendar from '@fullcalendar/react'; // must go before plugins
import dayGridPlugin from '@fullcalendar/daygrid'; // a plugin!
import interactionPlugin from '@fullcalendar/interaction'; // needed for dayClick

// project imports
//import { useStore } from '../../store/appStore';

// ==============================|| HOME ||============================== //

/**
 * A component that represents the landing page that the user visits after logging in.
 * @returns The Home component.
 */
const Calendar = () => {
  const handleEventClick = (info) => {
    // bind with an arrow function
    // change the border color just for fun
    alert('Event: ' + info.event.title);
    alert('Coordinates: ' + info.jsEvent.pageX + ',' + info.jsEvent.pageY);
    alert('View: ' + info.view.type);
  };

  return (
    <Paper sx={{ padding: '20px', width: '100%', height: '100%' }}>
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={[
          { title: "Professor Madooei's Office Hours", date: '2022-06-01' },
          { title: "Tarik's Office Hours", date: '2022-06-02' },
          { title: "Sofia's Office Hours", date: '2022-06-03' },
          { title: "Xinan's Office Hours", date: '2022-06-04' },
          { title: "Chiamaka's Office Hours", date: '2022-06-05' },
          { title: "Samuel's Office Hours", date: '2022-06-06' },
          { title: "Chris's Office Hours", date: '2022-06-07' },
        ]}
        eventClick={handleEventClick}
        height="100%"
        editable
      />
    </Paper>
  );
};

export default Calendar;
