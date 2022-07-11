import "@fullcalendar/react/dist/vdom"; // necessary to work with vite configuration
import FullCalendar from "@fullcalendar/react"; // must go before plugins
import dayGridPlugin from "@fullcalendar/daygrid"; // a plugin!
import interactionPlugin from "@fullcalendar/interaction"; // needed for dayClick
import timeGridPlugin from "@fullcalendar/timegrid";
import iCalendarPlugin from "@fullcalendar/icalendar";
import Box from "@mui/material/Box";
import useMediaQuery from "@mui/material/useMediaQuery";
import useTheme from "@mui/material/styles/useTheme";
import useStore from "../../services/store";
import { useEffect, useState } from "react";
import CalendarSpeedDial from "./CalendarSpeedDial";
import ical from "ical-generator";

/**
 * A component that represents the Calendar page for a course.
 * @returns The Calendar component.
 */
function Calendar() {
  const theme = useTheme();
  const matchUpSm = useMediaQuery(theme.breakpoints.up("sm"));
  const {
    currentCourse,
    courseType,
    createEventPopup,
    toggleCreateEventPopup,
    setCreateEventDate,
    setCreateEventStartTime,
    setCreateEventEndTime,
  } = useStore();
  const [isStaff, setIsStaff] = useState(false);
  const [icsURL, setIcsURL] = useState("");

  useEffect(() => {
    setIsStaff(courseType === "staff");
  }, [courseType]);

  useEffect(() => {
    const calendar = ical(JSON.parse(currentCourse.calendar));
    !createEventPopup && setIcsURL(calendar.toURL());
  }, [createEventPopup]);

  const handleEventClick = (info) => {
    alert("Event: " + info.event.title);
  };

  const handleSelect = (info) => {
    const start = new Date(info.start);
    const end = new Date(info.end);
    setCreateEventDate(start.toISOString().split("T")[0]);
    setCreateEventStartTime(start.toLocaleTimeString("it-IT").substring(0, 5));
    setCreateEventEndTime(end.toLocaleTimeString("it-IT").substring(0, 5));
    toggleCreateEventPopup(true);
  };

  return (
    <>
      <Box height="76vh">
        <FullCalendar
          plugins={[
            dayGridPlugin,
            timeGridPlugin,
            interactionPlugin,
            iCalendarPlugin,
          ]}
          headerToolbar={
            matchUpSm
              ? {
                  start: "dayGridMonth,timeGridWeek,timeGridDay",
                  center: "title",
                }
              : { start: "title", end: "prev,next" }
          }
          initialView="timeGridWeek"
          height="100%"
          eventClick={handleEventClick}
          editable={isStaff ? true : false}
          selectable={isStaff ? true : false}
          selectMirror={isStaff ? true : false}
          events={{
            url: icsURL,
            format: "ics",
          }}
          select={handleSelect}
          slotMinTime={"08:00:00"}
          slotMaxTime={"32:00:00"}
        />
      </Box>
      {isStaff && <CalendarSpeedDial />}
    </>
  );
}

export default Calendar;
