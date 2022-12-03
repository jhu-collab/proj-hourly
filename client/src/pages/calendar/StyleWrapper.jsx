import { Stack, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";

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

const StyleWrapper = styled("div")({
  height: "100%",
  ".fc-view-harness.fc-view-harness-active, .fc-scrollgrid.fc-scrollgrid-liquid, .fc-timegrid.fc-timeGridWeek-view.fc-view":
    {
      borderRadius: "20px",
      overflow: "hidden",
      boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)",
    },
  ".fc-scrollgrid-section.fc-scrollgrid-section-header, .fc-scroller-harness fc-scroller-harness-liquid":
    {
      background: "#64CFD9",
    },
  ".fc th": {
    borderStyle: "none !important",
  },
  ".fc-view-harness.fc-view-harness-active": {
    backgroundColor: "#fff",
  },
  ".fc-scroller": {
    overflow: "auto !important",
  },
});

export default StyleWrapper;
