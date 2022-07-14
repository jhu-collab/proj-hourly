import { Grid, Popover, Stack, Typography } from "@mui/material";
import React from "react";

function EventDetails({ anchorEl, handleClose, event }) {
  const open = Boolean(anchorEl);

  const date = event.start.toDateString();
  const startTime = event.start.toLocaleTimeString([], { timeStyle: "short" });
  const endTime = event.end.toLocaleTimeString([], { timeStyle: "short" });
  const location = event.extendedProps.location;

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
      <Grid container direction="row" sx={{ padding: 2 }}>
        <Grid item xs={10}>
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
        <Grid item xs={2}></Grid>
      </Grid>
    </Popover>
  );
}

export default EventDetails;
