import "@fullcalendar/react/dist/vdom"; // necessary to work with vite configuration
import FullCalendar from '@fullcalendar/react'; // must go before plugins
import dayGridPlugin from '@fullcalendar/daygrid'; // a plugin!

const events = [
    {
      id: 1,
      title: "Coding",
      start: new Date(new Date().setHours(new Date().getHours() - 3)),
      end: new Date(new Date().setHours(new Date().getHours() + 3)),
    },
  ];

export default function FullCalendarDemo() {
  return (
    <FullCalendar
        plugins={[ dayGridPlugin ]}
        initialView="dayGridMonth"
        events={events}
      />
  )
}
