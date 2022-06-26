import React from 'react';

// material-ui
import { Paper, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';

// full calendar
import FullCalendar from '@fullcalendar/react'; // must go before plugins
import dayGridPlugin from '@fullcalendar/daygrid'; // a plugin!
import interactionPlugin from '@fullcalendar/interaction'; // needed for dayClick
import timeGridPlugin from '@fullcalendar/timegrid';
import eventData from './calendar-data/event-data';

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
        events={eventData}
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
