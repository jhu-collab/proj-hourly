import "@fullcalendar/react/dist/vdom"; // necessary to work with vite configuration
import FullCalendar from "@fullcalendar/react"; // must go before plugins
import dayGridPlugin from "@fullcalendar/daygrid"; // a plugin!
import interactionPlugin from "@fullcalendar/interaction"; // needed for dayClick
import timeGridPlugin from "@fullcalendar/timegrid";
import { useMediaQuery, useTheme } from "@mui/material";

const events = [
  {
    title: "Professor Madooei's Office Hours",
    startRecur: "2022-06-26",
    startTime: "10:30:00",
    endTime: "11:30:00",
    daysOfWeek: ["0", "2", "4"],
  },
  {
    title: "Tarik's Office Hours",
    start: "2022-06-27T14:00:00",
    end: "2022-06-27T15:00:00",
  },
  {
    title: "Sofia's Office Hours",
    startRecur: "2022-06-26",
    startTime: "12:00:00",
    endTime: "13:00:00",
    daysOfWeek: ["2", "4", "6"],
  },
  {
    title: "Xinan's Office Hours",
    start: "2022-06-29T17:00:00",
    end: "2022-06-29T18:00:00",
  },
  {
    title: "Chiamaka's Office Hours",
    start: "2022-06-30T13:30:00",
    end: "2022-06-30T14:30:00",
  },
  {
    title: "Samuel's Office Hours",
    start: "2022-07-01T08:00:00",
    end: "2022-07-01T09:00:00",
  },
  {
    title: "Chris's Office Hours",
    start: "2022-07-02T11:00:00",
    end: "2022-07-02T12:00:00",
  },
];

/**
 * A component that represents the Calendar page for a course.
 * @returns The Calendar component.
 */
function Calendar() {
  const theme = useTheme();
  const matchUpSm = useMediaQuery(theme.breakpoints.up("sm"));

  return (
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
    />
  );
}

export default Calendar;
