import { Stack, Typography } from "@mui/material";
import React from "react";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import DownOutlined from "@ant-design/icons/DownOutlined";

function Registration({ registration }) {
  const onClick = () => {
    console.log("Click!");
  };
  return (
    <Accordion sx={{p: 1}}>
      <AccordionSummary expandIcon={<DownOutlined />}>
        <Stack direction="column" spacing={1}>
          <Typography>Date: <strong>{registration.date}</strong></Typography>
          <Typography>Time: <strong>{registration.startTime} - {registration.endTime}</strong>
          </Typography>
          <Typography>Type: <strong>Office Hours</strong></Typography>
        </Stack>
      </AccordionSummary>
      <AccordionDetails>
        <Typography>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
          malesuada lacus ex, sit amet blandit leo lobortis eget.
        </Typography>
      </AccordionDetails>
    </Accordion>
  );
}

export default Registration;
