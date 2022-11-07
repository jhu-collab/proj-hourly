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
import useStoreEvent from "../../hooks/useStoreEvent";
import useStoreLayout from "../../hooks/useStoreLayout";
import Box from "@mui/material/Box";

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

  const [isStaff, setIsStaff] = useState(false);
  const [menuOpen, setMenuOpen] = useState(true);

  const { isLoading, error, data } = useQueryOfficeHours();

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
      id: info.event.extendedProps.id,
      recurring: info.event.extendedProps.isRecurring,
    });
  };

  const handleSelect = (info) => {
    setEvent({
      start: info.start,
      end: info.end,
    });
    NiceModal.show("upsert-event", { type: "create" });
  };

  const handleEventDrop = (info) => {
    setEvent({
      title: info.event.title,
      start: info.event.start,
      end: info.event.end,
      location: info.event.extendedProps.location,
      id: info.event.extendedProps.id,
      recurring: info.event.extendedProps.isRecurring,
    });
    NiceModal.show("upsert-event", { type: "edit" });
    info.revert();
  };

  return (
    <>
      <Stack
        direction="row"
        sx={{ m: { xs: -2, sm: -3 }, pb: 1, height: "100%" }}
      >
        <Box sx={{ flexGrow: 1, pr: 2, pl: 2, pt: 2 }}>
          <FullCalendar
            plugins={[
              rrulePlugin,
              dayGridPlugin,
              timeGridPlugin,
              interactionPlugin,
            ]}
            customButtons={{
              mobileCalMenu: {
                text: "menu",
                click: function () {
                  setMobileCalMenu(!mobileCalMenu);
                },
              },
            }}
            headerToolbar={
              matchUpSm
                ? {
                    start: "prev",
                    center: "title",
                    end: "next",
                  }
                : { start: "title", end: "prev,next" }
            }
            initialView="timeGridWeek"
            height="100%"
            eventClick={handleEventClick}
            eventDrop={handleEventDrop}
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
            {...(!matchUpSm && { footerToolbar: { start: "mobileCalMenu" } })}
          />
        </Box>
        {matchUpSm && (
          <Box
            variant="outlined"
            sx={{
              height: "100%",
              boxShadow: theme.customShadows.z1,
              borderLeft: `2px solid ${theme.palette.divider}`,
            }}
          >
            <CalendarMenu calendarRef={calendarRef} />
          </Box>
        )}
      </Stack>
      {matchUpSm && <EventPopover />}
      {!matchUpSm && <MobileCalendarMenu calendarRef={calendarRef} />}
      {isLoading && <Loader />}
    </>
  );
}

export default Calendar;
