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
import { styled } from '@mui/material/styles';


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


 const StyleWrapper = styled('div') ({
  height: "100%",
  '.fc .fc-toolbar-title': {
    fontSize: "30px",
    fontWeight: 400,
    lineHeight: "36px",
    padding: 0,
    display: "inline",
  },
  '.fc-toolbar-chunk': {
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },
  '.fc-direction-ltr .fc-toolbar > * > :not(:first-child)': {
    marginLeft: 0
   },
   '.fc-button.fc-button-primary': {
    backgroundColor: "transparent",
    border: "none",
    color: "#48768C",
    fontSize: "20px",   
   },
   '.fc-button.fc-button-primary:focus': {
    backgroundColor: "transparent",
    border: "none",
    color: "#48768C",
    fontSize: "20px",
  },
  '.fc .fc-button-primary:not(:disabled):active': {
    backgroundColor: "transparent",
    border: "none",
    color: "#48768C",
    fontSize: "20px",
  }
});



  return (
    <>
      <Stack
        direction="row"
        sx={{ m: { xs: -2, sm: -3 }, pb: 1, height: "100%" }}
      >
        <Box sx={{ flexGrow: 1, pr: 2, pl: 2, pt: 2 }}>
          <StyleWrapper>
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
                    start: "",
                    center: "prev title next",
                    end: ""
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
          </StyleWrapper>
        </Box>
        {matchUpSm && (
          <Box
            variant="outlined"
            sx={{
              height: "100%",
              boxShadow: `0px 6px 30px 5px rgba(0,0,0,0.12), 0px 16px 24px 2px rgba(0,0,0,0.14), 0px 8px 10px -5px rgba(0,0,0,0.20)`,
              backgroundColor: "background.paper",
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
