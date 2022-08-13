import { Button, Stack, Typography } from "@mui/material";
import React from "react";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import DownOutlined from "@ant-design/icons/DownOutlined";
import moment from "moment";
import ConfirmPopup, { confirmDialog } from "../../components/ConfirmPopup";

function Registration({ registration, type }) {
  return (
    <Accordion sx={{ paddingX: 2, paddingY: 1 }}>
      <AccordionSummary expandIcon={<DownOutlined />}>
        <Stack
          sx={{ flexGrow: 0.8 }}
          direction={{ xs: "column", sm: "row" }}
          alignItems="center"
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
        {/* TODO: Depending on what type of booking this event has been made for,
         details about the event will be provided here */}
        {type === 0 && (
          <>
            <Button
              variant="contained"
              onClick={() => {
                confirmDialog(
                  "Do you want to cancel this registration?",
                  () => console.log("Registration canceled.") // TODO: Need route to cancel event
                );
              }}
            >
              Cancel
            </Button>
            <ConfirmPopup />
          </>
        )}
      </AccordionDetails>
    </Accordion>
  );
}

export default Registration;
