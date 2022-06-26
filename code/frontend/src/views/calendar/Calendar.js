import React from 'react';

// material-ui
import { Paper, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';

// full calendar
import FullCalendar from '@fullcalendar/react'; // must go before plugins
import dayGridPlugin from '@fullcalendar/daygrid'; // a plugin!
import interactionPlugin from '@fullcalendar/interaction'; // needed for dayClick
import timeGridPlugin from '@fullcalendar/timegrid';

// project imports
//import { useStore } from '../../store/appStore';

// ==============================|| HOME ||============================== //

/**
 * A component that represents the landing page that the user visits after logging in.
 * @returns The Home component.
 */
const Calendar = () => {
  const theme = useTheme();
  const matchUpSm = useMediaQuery(theme.breakpoints.up('sm'));

  const handleEventClick = (info) => {
    // bind with an arrow function
    alert('Event: ' + info.event.title);
    alert('Coordinates: ' + info.jsEvent.pageX + ',' + info.jsEvent.pageY);
    alert('View: ' + info.view.type);
  };

  return (
    <Paper sx={{ padding: '20px', width: '100%', height: '100%' }}>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        headerToolbar={
          matchUpSm
            ? {
                start: 'dayGridMonth,timeGridWeek,timeGridDay',
                center: 'title',
              }
            : { start: 'title', end: 'prev,next' }
        }
        initialView="timeGridWeek"
        events={[
          { title: "Professor Madooei's Office Hours", date: '2022-06-26' },
          { title: "Tarik's Office Hours", date: '2022-06-27' },
          { title: "Sofia's Office Hours", date: '2022-06-28' },
          { title: "Xinan's Office Hours", date: '2022-06-29' },
          { title: "Chiamaka's Office Hours", date: '2022-06-30' },
          { title: "Samuel's Office Hours", date: '2022-07-01' },
          { title: "Chris's Office Hours", date: '2022-07-02' },
        ]}
        eventClick={handleEventClick}
        dateClick={handleEventClick}
        height="100%"
        editable
        selectable
      />
    </Paper>
  );
};

export default Calendar;
