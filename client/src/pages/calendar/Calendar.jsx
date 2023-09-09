import "@fullcalendar/react/dist/vdom"; // necessary to work with vite configuration
import FullCalendar from "@fullcalendar/react"; // must go before plugins
import rrulePlugin from "@fullcalendar/rrule";
import timeGridPlugin from "@fullcalendar/timegrid";
import dayGridPlugin from "@fullcalendar/daygrid"; // a plugin!
import interactionPlugin from "@fullcalendar/interaction"; // needed for dayClick
import useMediaQuery from "@mui/material/useMediaQuery";
import useTheme from "@mui/material/styles/useTheme";
import Stack from "@mui/material/Stack";
import { useEffect, useRef, useState } from "react";
import EventPopover from "./event-details/EventPopover";
import Loader from "../../components/Loader";
import NiceModal from "@ebay/nice-modal-react";
import CalendarMenu from "./calendar-menu/CalendarMenu";
import MobileCalendarMenu from "./calendar-menu/MobileCalendarMenu";
import useQueryOfficeHours from "../../hooks/useQueryOfficeHours";
import useQueryCourseEvents from "../../hooks/useQueryCourseEvents";
import useStoreEvent from "../../hooks/useStoreEvent";
import useStoreLayout from "../../hooks/useStoreLayout";

import useStoreToken from "../../hooks/useStoreToken";
import { decodeToken } from "react-jwt";

import Box from "@mui/material/Box";
import StyleWrapper, {
  dayHeaderContent,
  eventColorPalette,
  eventContent,
  nowIndicatorContent,
  slotLabelContent,
} from "./CalendarTheme";

/**
 * A component that represents the Calendar page for a course.
 * @returns The Calendar component.
 */
function Calendar() {
  const theme = useTheme();
  const matchUpSm = useMediaQuery(theme.breakpoints.up("sm"));

  const calendarRef = useRef();

  const setEvent = useStoreEvent((state) => state.setEvent);
  const courseType = useStoreLayout((state) => state.courseType);
  const setAnchorEl = useStoreLayout((state) => state.setEventAnchorEl);
  const mobileCalMenu = useStoreLayout((state) => state.mobileCalMenu);
  const setMobileCalMenu = useStoreLayout((state) => state.setMobileCalMenu);
  const openSidebar = useStoreLayout((state) => state.openSidebar);

  const token = useStoreToken((state) => state.token);
  const { id } = decodeToken(token);

  const [filtered, setFiltered] = useState("all");
  const [isStaff, setIsStaff] = useState(false);
  const [maxEventsStacked, setMaxEventsStacked] = useState(2);

  const {
    isLoading: isOfficeHoursLoading,
    error: officeHoursError,
    data: officeHoursData,
  } = useQueryOfficeHours();
  const {
    isLoading: isCourseEventsLoading,
    error: courseEventsError,
    data: courseEventsData,
  } = useQueryCourseEvents();

  useEffect(() => {
    setIsStaff(courseType === "Staff" || courseType === "Instructor");
  }, [courseType]);

  useEffect(() => {
    setTimeout(() => calendarRef.current.getApi().updateSize(), 500);
  }, [openSidebar]);

  const handleEventClick = (info) => {
    matchUpSm ? setAnchorEl(info.el) : NiceModal.show("mobile-event-popup");
    setEvent({
      title: info.event.title,
      start: info.event.start,
      end: info.event.end,
      location: info.event.extendedProps.location,
      id: info.event.extendedProps.id,
      recurring: info.event.extendedProps.isRecurring,
      hosts: info.event.extendedProps.hosts,
      isRemote: info.event.extendedProps.isRemote,
      allDay: info.event.allDay,
      resources: info.event.extendedProps.additionalInfo,
      isCancelled: info.event.extendedProps.isCancelled,
    });
  };

  const handleSelect = (info) => {
    setEvent({
      start: info.start,
      end: info.end,
    });
    NiceModal.show("upsert-event", { type: "create" });
  };

  const handleSelectAllow = (event) => {
    const startDate = event.start;
    const endDate = event.end;
    endDate.setSeconds(endDate.getSeconds() - 1);
    if (startDate.getDate() === endDate.getDate()) {
      return true;
    }

    return false;
  };

  const handleEventDrop = (info) => {
    setEvent({
      title: info.event.title,
      start: info.event.start,
      end: info.event.end,
      location: info.event.extendedProps.location,
      id: info.event.extendedProps.id,
      recurring: info.event.extendedProps.isRecurring,
      isRemote: info.event.extendedProps.isRemote,
    });
    NiceModal.show("upsert-event", { type: "edit" });
    info.revert();
  };

  const filter = (data) => {
    const filtered = data.calendar.filter(function (officeHour) {
      const hosts = officeHour.extendedProps.hosts;
      for (let i = 0; i < hosts.length; i++) {
        if (hosts[i].id == id) {
          return true;
        }
      }
      return false;
    });
    return filtered;
  };

  const chosenData = (data) => {
    if (!data || !data.calendar || data.calendar.length === 0) {
      return [];
    } else {
      if (filtered === "all") {
        return data.calendar;
      } else if (filtered === "mine") {
        return filter(data);
      } else {
        return [];
      }
    }
  };

  const allChosenData = () => {
    let data = [];

    if (Array.isArray(officeHoursData?.calendar)) {
      data = data.concat(chosenData(officeHoursData));
    }

    if (
      Array.isArray(courseEventsData?.calendarEvents) &&
      courseEventsData &&
      courseEventsData.calendarEvents &&
      courseEventsData.calendarEvents.length !== 0
    ) {
      data = data.concat(courseEventsData.calendarEvents);
    }

    return data;
  };

  return (
    <>
      <Stack
        direction="row"
        sx={{ m: { xs: -2, sm: -3 }, pb: 1, height: "100%" }}
      >
<<<<<<< HEAD
        
        <Box data-cy="full-calendar" sx={{ flexGrow: 1, paddingX: 4, pt: 2, pb: 3 }}>
=======
        <Box sx={{ flexGrow: 1, paddingX: 4, pt: 2, pb: 15 }}>
>>>>>>> dev
          <StyleWrapper>
            {matchUpSm && (
              <CalendarMenu
                calendarRef={calendarRef}
                isStaff={isStaff}
                setFiltered={setFiltered}
                setMaxEventsStacked={setMaxEventsStacked}
              />
            )}
            <FullCalendar
              plugins={[
                rrulePlugin,
                dayGridPlugin,
                timeGridPlugin,
                interactionPlugin,
              ]}
              customButtons={{
                mobileCalMenu: {
                  text: "view options",
                  click: function () {
                    setMobileCalMenu(!mobileCalMenu);
                  },
                },
              }}
              headerToolbar={
                matchUpSm
                  ? {
                      start: "",
                      center: "prev title next",
                      end: "",
                    }
                  : { start: "title", end: "prev,next" }
              }
              initialView="timeGridWeek"
              height="100%"
              eventClick={handleEventClick}
              eventBackgroundColor={eventColorPalette[0].bottomColor}
              eventContent={eventContent}
              eventDrop={handleEventDrop}
              editable={isStaff ? true : false}
              eventStartEditable={false}
              eventDurationEditable={false}
              eventMaxStack={maxEventsStacked}
              selectable={isStaff ? true : false}
              selectAllow={handleSelectAllow}
              selectMirror={isStaff ? true : false}
              unselectAuto={true}
              events={allChosenData()}
              select={handleSelect}
              slotDuration="0:30:00"
              slotLabelFormat={{
                hour: "numeric",
                minute: "2-digit",
                omitZeroMinute: false,
              }}
              slotLabelContent={slotLabelContent}
              slotEventOverlap={false}
              ref={calendarRef}
              dayHeaderContent={dayHeaderContent}
              allDaySlot={true}
              nowIndicator
              nowIndicatorContent={nowIndicatorContent}
              {...(!matchUpSm && {
                headerToolbar: {
                  start: "mobileCalMenu",
                  center: "prev title next",
                  end: "",
                },
              })}
            />
          </StyleWrapper>
        </Box>
      </Stack>
      {matchUpSm && <EventPopover />}
      {!matchUpSm && (
        <MobileCalendarMenu
          calendarRef={calendarRef}
          isStaff={isStaff}
          setFiltered={setFiltered}
        />
      )}
      {(isOfficeHoursLoading || isCourseEventsLoading) && <Loader />}
    </>
  );
}

export default Calendar;
