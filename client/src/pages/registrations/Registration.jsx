import { Stack, Typography } from "@mui/material";
import React from "react";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import DownOutlined from "@ant-design/icons/DownOutlined";
import moment from "moment";

function Registration({ registration }) {
  const onClick = () => {
    console.log("Click!");
  };
  return (
    <Accordion sx={{ paddingX: 2, paddingY: 1 }}>
      <AccordionSummary expandIcon={<DownOutlined />}>
        <Stack direction="column" spacing={1}>
          <Typography>
            Date:{" "}
            <strong>{moment(registration.date).utc().format("LL")}</strong>
          </Typography>
          <Typography>
            Time:{" "}
            <strong>
              {moment(registration.startTime).utc().format("hh:mmA")} -{" "}
              {moment(registration.endTime).utc().format("hh:mmA")}
            </strong>
          </Typography>
          <Typography>
            Type: <strong>Office Hours</strong>
          </Typography>
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
