import "@fullcalendar/react/dist/vdom"; // necessary to work with vite configuration
import FullCalendar from "@fullcalendar/react"; // must go before plugins
import rrulePlugin from "@fullcalendar/rrule";
import dayGridPlugin from "@fullcalendar/daygrid"; // a plugin!
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction"; // needed for dayClick
import Box from "@mui/material/Box";
import useMediaQuery from "@mui/material/useMediaQuery";
import useTheme from "@mui/material/styles/useTheme";
import { useEventStore, useLayoutStore } from "../../services/store";
import { useEffect, useRef, useState } from "react";
import CalendarSpeedDial from "./CalendarSpeedDial";
import EventPopover from "./event-details/EventPopover";
import { useQuery } from "react-query";
import { getOfficeHours } from "../../utils/requests";
import Loader from "../../components/Loader";
import NiceModal from "@ebay/nice-modal-react";

/**
 * A component that represents the Calendar page for a course.
 * @returns The Calendar component.
 */
function Calendar() {
  const theme = useTheme();
  const matchUpSm = useMediaQuery(theme.breakpoints.up("sm"));

  const calendarRef = useRef();

  const setEvent = useEventStore((state) => state.setEvent);
  const courseType = useLayoutStore((state) => state.courseType);
  const setAnchorEl = useLayoutStore((state) => state.setEventAnchorEl);

  const [isStaff, setIsStaff] = useState(false);

  const { isLoading, error, data } = useQuery(["officeHours"], getOfficeHours);

  useEffect(() => {
    setIsStaff(courseType === "staff");
  }, [courseType]);

  const handleEventClick = (info) => {
    matchUpSm ? setAnchorEl(info.el) : NiceModal.show("mobile-event-popup");
    setEvent({
      title: info.event.title,
      start: info.event.start,
      end: info.event.end,
      location: info.event.extendedProps.location,
      description: JSON.parse(info.event.extendedProps.description),
    });
  };

  const handleSelect = (info) => {
    setEvent({
      start: info.start,
      end: info.end,
    });
    NiceModal.show("upsert-event", { type: "create" });
  };

  // TODO: Resolve confusion between edit and create
  // popup
  // const handleEventDrop = (info) => {
  //   setEvent({
  //     title: info.event.title,
  //     start: info.event.start,
  //     end: info.event.end,
  //     location: info.event.extendedProps.location,
  //     description: JSON.parse(info.event.extendedProps.description),
  //   });
  //   editPopupState.open();
  // };

  return (
    <>
      <Box height="76vh">
        <FullCalendar
          plugins={[
            rrulePlugin,
            dayGridPlugin,
            timeGridPlugin,
            interactionPlugin,
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
          eventStartEditable={false} // Disabled for now
          editable={isStaff ? true : false}
          selectable={isStaff ? true : false}
          selectMirror={isStaff ? true : false}
          unselectAuto={false}
          events={data?.calendar || []}
          select={handleSelect}
          slotMinTime={"08:00:00"}
          slotMaxTime={"32:00:00"}
          timeZone="UTC"
          ref={calendarRef}
        />
      </Box>
      {matchUpSm && <EventPopover />}
      {isStaff && <CalendarSpeedDial calendarRef={calendarRef} />}
      {isLoading && <Loader />}
    </>
  );
}

export default Calendar;
