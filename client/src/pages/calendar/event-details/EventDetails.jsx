import CloseOutlined from "@ant-design/icons/CloseOutlined";
import InfoCircleOutlined from "@ant-design/icons/InfoCircleOutlined";
import EditOutlined from "@ant-design/icons/EditOutlined";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import Popover from "@mui/material/Popover";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import React, { useEffect } from "react";
import { useState } from "react";
import { getLocaleTime } from "../../../utils/helpers";
import DeleteAction from "./DeleteAction";

function EventDetails({ anchorEl, handleClose, event }) {
  const open = Boolean(anchorEl);
  const { start, end, extendedProps } = event;
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [location, setLocation] = useState("");

  useEffect(() => {
    if (start) {
      setDate(start.toDateString());

      const startTimeStr = start.toUTCString().substring(17, 22);
      setStartTime(getLocaleTime(startTimeStr));
    }

    if (end) {
      const endTimeStr = end.toUTCString().substring(17, 22);
      setEndTime(getLocaleTime(endTimeStr));
    }

    setLocation(extendedProps?.location);
  }, [start, end, extendedProps]);

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={handleClose}
      anchorOrigin={{
        vertical: "top",
        horizontal: "left",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
    >
      <Grid
        container
        direction="row"
        columnSpacing={3}
        sx={{ padding: 2, pr: 1 }}
      >
        <Grid item xs={8} sx={{ mt: 0.5 }}>
          <Stack direction="column" spacing={1}>
            <Typography variant="h4">{event.title}</Typography>
            <Typography>
              <strong>Date: </strong>
              {date}
            </Typography>
            <Typography>
              <strong>Time: </strong>
              {startTime} - {endTime}
            </Typography>
            <Typography>
              <strong>Location: </strong>
              {location}
            </Typography>
          </Stack>
        </Grid>
        <Grid item xs={4}>
          <Stack direction="row" justifyContent="flex-end">
            <IconButton sx={{ fontSize: "20px" }}>
              <InfoCircleOutlined />
            </IconButton>
            <IconButton sx={{ fontSize: "20px" }}>
              <EditOutlined />
            </IconButton>
            <DeleteAction event={event} handleClose={handleClose} />
            <IconButton sx={{ fontSize: "20px" }} onClick={handleClose}>
              <CloseOutlined />
            </IconButton>
          </Stack>
        </Grid>
      </Grid>
    </Popover>
  );
}

export default EventDetails;
