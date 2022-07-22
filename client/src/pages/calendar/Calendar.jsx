import "@fullcalendar/react/dist/vdom"; // necessary to work with vite configuration
import FullCalendar from "@fullcalendar/react"; // must go before plugins
import dayGridPlugin from "@fullcalendar/daygrid"; // a plugin!
import interactionPlugin from "@fullcalendar/interaction"; // needed for dayClick
import timeGridPlugin from "@fullcalendar/timegrid";
import iCalendarPlugin from "@fullcalendar/icalendar";
import Box from "@mui/material/Box";
import useMediaQuery from "@mui/material/useMediaQuery";
import useTheme from "@mui/material/styles/useTheme";
import useStore, {
  useEventPopupStore,
  useEventStore,
} from "../../services/store";
import { useEffect, useMemo, useState } from "react";
import CalendarSpeedDial from "./CalendarSpeedDial";
import ical from "ical-generator";
import EventPopover from "./event-details/EventPopover";
import { useQuery } from "react-query";
import { getOfficeHours } from "../../utils/requests";
import Loader from "../../components/Loader";
import MobileEventPopup from "./event-details/MobileEventPopup";

/**
 * A component that represents the Calendar page for a course.
 * @returns The Calendar component.
 */
function Calendar() {
  const theme = useTheme();
  const matchUpSm = useMediaQuery(theme.breakpoints.up("sm"));

  const { courseType, toggleCreateEventPopup } = useStore();
  const { setEvent } = useEventStore();
  const { togglePopup } = useEventPopupStore();
  const [openMobile, setMobile] = useState(false);

  const [isStaff, setIsStaff] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const { isLoading, error, data } = useQuery(["officeHours"], getOfficeHours);

  useEffect(() => {
    setIsStaff(courseType === "staff");
  }, [courseType]);

  const handleMobilePopup = () => {
    togglePopup(!openMobile);
    setMobile(!openMobile);
  };

  const handleEventClick = (info) => {
    matchUpSm ? setAnchorEl(info.el) : handleMobilePopup();
    setEvent({
      title: info.event.title,
      start: info.event.start,
      end: info.event.end,
      location: info.event.extendedProps.location,
      description: JSON.parse(info.event.extendedProps.description),
    });
  };

  const handleClosePopover = () => {
    setAnchorEl(null);
  };

  const handleSelect = (info) => {
    setEvent({
      start: info.start,
      end: info.end,
    });
    toggleCreateEventPopup(true);
  };

  const memoizedEventsFn = useMemo(() => {
    if (data) {
      const calendar = ical(data.calendar);
      return { url: calendar.toURL(), format: "ics" };
    }
    return { url: ical().toURL(), format: "ics" };
  }, [data]);

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
          events={memoizedEventsFn}
          select={handleSelect}
          slotMinTime={"08:00:00"}
          slotMaxTime={"32:00:00"}
          timeZone="UTC"
        />
      </Box>
      {matchUpSm ? (
        <EventPopover anchorEl={anchorEl} handleClose={handleClosePopover} />
      ) : (
        <MobileEventPopup
          open={openMobile}
          handlePopupToggle={handleMobilePopup}
        />
      )}
      {isStaff && <CalendarSpeedDial />}
      {isLoading && <Loader />}
    </>
  );
}

export default Calendar;
