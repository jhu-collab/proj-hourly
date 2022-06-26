import React from 'react';

// material-ui
import { Paper, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';

// full calendar
import FullCalendar from '@fullcalendar/react'; // must go before plugins
import dayGridPlugin from '@fullcalendar/daygrid'; // a plugin!
import interactionPlugin from '@fullcalendar/interaction'; // needed for dayClick
import timeGridPlugin from '@fullcalendar/timegrid';
import { useStore } from 'store/appStore';
import CreateEvent from './create-event/CreateEvent';

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

  const createEventPopup = useStore((state) => state.createEventPopup);
  const createEventPopupOpen = useStore((state) => state.createEventPopupOpen);
  const setCreateEventDate = useStore((state) => state.setCreateEventDate);
  const setCreateEventStartTime = useStore(
    (state) => state.setCreateEventStartTime,
  );
  const setCreateEventEndTime = useStore(
    (state) => state.setCreateEventEndTime,
  );
  const events = useStore((state) => state.events);

  const handleEventClick = (info) => {
    alert('Event: ' + info.event.title);
  };

  const handleDateClick = (info) => {
    const start = new Date(info.start);
    const end = new Date(info.end);
    setCreateEventDate(start.toISOString().split('T')[0]);
    setCreateEventStartTime(start.toLocaleTimeString('it-IT').substring(0, 5));
    setCreateEventEndTime(end.toLocaleTimeString('it-IT').substring(0, 5));
    createEventPopupOpen();
  };

  return (
    <>
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
          events={events}
          eventClick={handleEventClick}
          height="100%"
          editable
          select={handleDateClick}
          selectMirror
          selectable
        />
      </Paper>
      {createEventPopup && <CreateEvent />}
    </>
  );
};

export default Calendar;
