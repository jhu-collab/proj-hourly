import { Stack, Typography } from "@mui/material";
import React from "react";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import DownOutlined from "@ant-design/icons/DownOutlined";
import moment from "moment";

function Registration({ registration }) {
    console.log(registration);
  return (
    <Accordion sx={{ paddingX: 2, paddingY: 1 }}>
      <AccordionSummary expandIcon={<DownOutlined />}>
        <Stack
          sx={{ flexGrow: 0.8 }}
          direction="row"
          alignItems="flex-start"
          justifyContent="space-between"
          spacing={2}
        >
          <Typography fontWeight={600}>
            {moment(registration.date).utc().format("LL")}
          </Typography>
          <Typography fontWeight={600}>
            {moment(registration.startTime).utc().format("hh:mmA")} -{" "}
            {moment(registration.endTime).utc().format("hh:mmA")}
          </Typography>
          <Typography>
            Type: <strong>Office Hours</strong>
          </Typography>
        </Stack>
      </AccordionSummary>
      <AccordionDetails>
        <Typography>
          <strong>Location: </strong>
          {registration.location}
        </Typography>
      </AccordionDetails>
    </Accordion>
  );
}

export default Registration;
