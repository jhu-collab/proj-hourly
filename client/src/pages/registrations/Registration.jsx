import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import DownOutlined from "@ant-design/icons/DownOutlined";
import { DateTime } from "luxon";
import ConfirmPopup, { confirmDialog } from "../../components/ConfirmPopup";

/**
 * Represents a single Registration card.
 * @param {*} registration registration object
 * @param {Number} type a number that represents the type of
 *                      registrations. 0 for upcoming. 1 for
 *                      ongoing. 2 for past.
 * @returns a single Registration component.
 */
function Registration({ registration, type }) {
  return (
    <Accordion sx={{ paddingX: 2, paddingY: 1 }}>
      <AccordionSummary expandIcon={<DownOutlined />}>
        <Stack
          sx={{ flexGrow: 1, pr: 2 }}
          direction={{ xs: "column", sm: "row" }}
          alignItems="center"
          justifyContent="space-between"
          spacing={2}
        >
          <Typography fontWeight={600}>
            {DateTime.fromJSDate(registration.date, {
              zone: "utc",
            }).toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY)}
          </Typography>
          <Typography fontWeight={600}>
            {DateTime.fromJSDate(registration.startTime, {
              zone: "utc",
            }).toLocaleString(DateTime.TIME_SIMPLE)}{" "}
            -{" "}
            {DateTime.fromJSDate(registration.endTime, {
              zone: "utc",
            }).toLocaleString(DateTime.TIME_SIMPLE)}
          </Typography>
          <Typography>
            Type: <strong>Office Hours</strong>
          </Typography>
        </Stack>
      </AccordionSummary>
      <AccordionDetails sx={{ pr: 5 }}>
        {/* TODO: Depending on what type of booking this event has been made for,
         details about the event will be provided here */}
        {type === 0 && (
          <>
            <Button
              variant="contained"
              size="large"
              fullWidth
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
