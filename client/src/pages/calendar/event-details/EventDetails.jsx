import CloseOutlined from "@ant-design/icons/CloseOutlined";
import InfoCircleOutlined from "@ant-design/icons/InfoCircleOutlined";
import EditOutlined from "@ant-design/icons/EditOutlined";
import DeleteOutlined from "@ant-design/icons/DeleteOutlined";
import { Grid, IconButton, Popover, Stack, Typography } from "@mui/material";
import React from "react";

function EventDetails({ anchorEl, handleClose, event }) {
  const open = Boolean(anchorEl);

  const date = event?.start?.toDateString();
  const startTime = event?.start?.toLocaleTimeString([], {
    timeStyle: "short",
  });
  const endTime = event?.end?.toLocaleTimeString([], { timeStyle: "short" });
  const location = event?.extendedProps?.location;

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
            <IconButton sx={{ fontSize: "20px" }}>
              <DeleteOutlined />
            </IconButton>
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
