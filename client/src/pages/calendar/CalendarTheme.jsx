import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { styled } from "@mui/material/styles";

export const eventColorPalette = [
  {
    topColor:
      "linear-gradient(to right, rgba(88, 183, 191, 1), rgba(100, 207, 217, 0))",
    bottomColor: "rgba(88, 183, 191, 0.25)",
    monthColor: "rgba(88, 183, 191, 1)",
  },
  {
    topColor:
      "linear-gradient(to right, rgba(112, 135, 219, 1), rgba(100, 207, 217, 0))",
    bottomColor: "rgba(112, 135, 219, 0.25)",
    monthColor: "rgba(112, 135, 219, 1)",
  },
  {
    topColor:
      "linear-gradient(to right, rgba(25, 118, 210, 0.9), rgba(100, 207, 217, 0))",
    bottomColor: "rgba(25, 118, 210, 0.2)",
    monthColor: "rgba(25, 118, 210, 0.9)",
  },
  {
    topColor:
      "linear-gradient(to right, rgba(221, 139, 79, 1), rgba(217, 212, 100, 0))",
    bottomColor: "rgba(245, 184, 64, 0.25)",
    monthColor: "rgba(221, 139, 79, 1)",
  },
  {
    topColor:
      "linear-gradient(to right, rgba(201, 81, 81, 1), rgba(217, 156, 100, 0))",
    bottomColor: "rgba(227, 167, 167, 0.25)",
    monthColor: "rgba(201, 81, 81, 1)",
  },
  {
    topColor:
      "linear-gradient(to right, rgba(83, 150, 60, 1), rgba(100, 217, 161, 0))",
    bottomColor: "rgba(137, 197, 115, 0.25)",
    monthColor: "rgba(83, 150, 60, 1)",
  },
];

const dowConverter = (dow) => {
  switch (dow) {
    case 0:
      return "Sun";
    case 1:
      return "Mon";
    case 2:
      return "Tue";
    case 3:
      return "Wed";
    case 4:
      return "Thu";
    case 5:
      return "Fri";
    default:
      return "Sat";
  }
};

export const dayHeaderContent = (arg) => {
  if (arg.view.type === "timeGridWeek") {
    return (
      <Stack>
        <Typography fontWeight={400} fontSize={23}>
          {arg.date.getDate()}
        </Typography>
        <Typography fontWeight={400} fontSize={17}>
          {dowConverter(arg.dow)}
        </Typography>
      </Stack>
    );
  }
  return (
    <Typography fontWeight={400} fontSize={23}>
      {dowConverter(arg.dow)}
    </Typography>
  );
};

export const slotLabelContent = (arg) => {
  return (
    <Typography fontWeight={400} color="#48768C">
      {arg.text}
    </Typography>
  );
};

export const nowIndicatorContent = (arg) => {
  return (
    <Box
      height={10}
      width={10}
      marginTop={-0.75}
      sx={{ backgroundColor: "#1976D2", borderRadius: "50%" }}
    />
  );
};

export const eventContent = (arg) => {
  let hostId = 0;
  if (Boolean(arg.event.extendedProps.hosts)) {
    hostId = arg.event.extendedProps.hosts[0].id;
  }
  arg.backgroundColor = eventColorPalette[hostId % 6].monthColor;

  if (arg.view.type === "timeGridWeek" || arg.view.type === "timeGridDay") {
    if (arg.event.allDay) {
      arg.backgroundColor = arg.event.extendedProps.isCancelled
        ? "rgb(128 , 128, 128, 0.5)"
        : "rgba(88, 183, 191, 0.5)";
      return (
        <Stack justifyContent="center" alignItems="center" spacing={1}>
          <Box
            height="auto"
            width="101.5%"
            padding="0"
            marginTop="-1px"
            marginLeft="-1px"
            justifyContent="center"
            alignItems="center"
            display="flex"
            sx={{
              background: arg.backgroundColor,
              borderRadius: "0px 15px 0px 0px",
            }}
          >
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              width="80%"
            >
              <Typography
                fontWeight={400}
                color="white"
                whiteSpace="pre-wrap"
                margin="7px"
              >
                {arg.event.title}
              </Typography>
            </Box>
          </Box>
        </Stack>
      );
    }

    arg.backgroundColor = eventColorPalette[hostId % 6].bottomColor;
    return (
      <Stack
        data-cy={`event-${arg.timeText}`}
        justifyContent="center"
        alignItems="center"
        spacing={1}
      >
        <Box
          height="25px"
          width="101.5%"
          padding="0"
          marginTop="-1px"
          marginLeft="-1px"
          justifyContent="center"
          alignItems="center"
          display="flex"
          sx={{
            background: eventColorPalette[hostId % 6].topColor,
            borderRadius: "0px 15px 0px 0px",
          }}
        >
          <Typography fontWeight={400} color="white">
            {arg.timeText}
          </Typography>
        </Box>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          width="80%"
        >
          {Boolean(arg.event.title) && (
            <Typography lineHeight="15.8px" color="text.primary">
              {arg.event.title}
            </Typography>
          )}
        </Box>
      </Stack>
    );
  }
};

const StyleWrapper = styled("div")({
  height: "100%",
  ".fc-view-harness.fc-view-harness-active, .fc-scrollgrid.fc-scrollgrid-liquid, .fc-timegrid.fc-timeGridWeek-view.fc-view":
    {
      borderRadius: "20px",
      overflow: "hidden",
      boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)",
    },
  ".fc-scrollgrid-section.fc-scrollgrid-section-header": {
    background: "#64CFD9",
  },
  ".fc th": {
    borderStyle: "none !important",
  },
  ".fc-view-harness.fc-view-harness-active": {
    backgroundColor: "#fff",
  },
  ".fc-scroller": {
    overflowY: "auto !important",
  },
  ".fc-timegrid-slot.fc-timegrid-slot-lane ": {
    height: "36px",
    borderBottom: "0 !important",
  },
  ".fc-theme-standard td, .fc-theme-standard th": {
    border: "1px solid rgba(232, 243, 247, 1)",
  },
  ".fc .fc-daygrid-day.fc-day-today": {
    backgroundColor: "rgba(174, 245, 233, 0.15)",
  },
  ".fc .fc-timegrid-col.fc-day-today": {
    backgroundColor: "rgba(174, 245, 233, 0.15)",
  },
  ".fc-col-header-cell.fc-day.fc-day-today ": {
    backgroundColor: "#AEF5E9",
  },
  ".fc .fc-timegrid-now-indicator-line": {
    borderColor: "#1976D2",
    borderWidth: "1.5px 0 0",
    marginRight: "12px",
  },
  ".fc-timegrid-now-indicator-arrow": {
    display: "none",
  },
  ".fc-toolbar-title": {
    display: "inline",
    fontSize: "30px",
    fontWeight: "400",
  },
  ".fc-toolbar-chunk": {
    display: "flex",
    alignItems: "center",
    marginBottom: -15,
  },
  ".fc .fc-button": {
    color: "#48768C",
    fontSize: "20px",
    borderStyle: "none",
    backgroundColor: "transparent",
  },
  ".fc .fc-button:not(:disabled):active, .fc .fc-button:hover": {
    backgroundColor: "transparent",
    color: "#64CFD9",
  },
  ".fc .fc-button:focus, .fc .fc-button:not(:disabled):active:focus, .fc .fc-button:not(:disabled).fc-button-active:focus":
    {
      boxShadow: "0px 0 0",
    },
  ".fc-event": {
    borderRadius: "0px 15px 15px 15px",
    borderStyle: "none",
    width: "95%",
    marginLeft: "3px",
    overflow: "hidden",
  },
});

export default StyleWrapper;
