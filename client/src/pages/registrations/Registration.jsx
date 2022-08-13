import { CardActionArea, Stack, Typography } from "@mui/material";
import React from "react";
import MainCard from "../../components/MainCard";

function Registration({ registration }) {
  const onClick = () => {
    console.log("Click!");
  };
  return (
    <MainCard content={false}>
      <CardActionArea sx={{ padding: 2 }} onClick={onClick}>
        <Stack direction="column" spacing={1}>
          <Typography fontWeight={600}>{registration.date}</Typography>
          <Typography fontWeight={600}>
            {registration.startTime} - {registration.endTime}
          </Typography>
          <Typography fontWeight={600}>
            Type: Office Hours
          </Typography>
        </Stack>
      </CardActionArea>
    </MainCard>
  );
}

export default Registration;
