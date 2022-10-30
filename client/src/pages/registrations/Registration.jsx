import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import DownOutlined from "@ant-design/icons/DownOutlined";
import { DateTime } from "luxon";
import ConfirmPopup, { confirmDialog } from "../../components/ConfirmPopup";

// TODO: Registration route needs to be updated to include topics
const sampleTopics = [
  { id: 1, value: "Arrays" },
  { id: 2, value: "Recursion" },
  { id: 3, value: "Loops" },
  { id: 4, value: "Conditionals" },
  { id: 5, value: "Sorting" },
  { id: 6, value: "Input" },
  { id: 7, value: "Trees" },
  { id: 8, value: "Linear Search" },
];

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
            {DateTime.fromISO(registration.date, {
              zone: "utc",
            }).toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY)}
          </Typography>
          <Typography fontWeight={600}>
            {DateTime.fromISO(registration.startTime, {
              zone: "utc",
            }).toLocaleString(DateTime.TIME_SIMPLE)}{" "}
            -{" "}
            {DateTime.fromISO(registration.endTime, {
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
            <Typography fontWeight={600}>Selected Topics:</Typography>
            <Grid container spacing={1} marginBottom={4}>
              {sampleTopics.map((topic) => {
                return (
                  <Grid item key={topic.id}>
                    <Chip label={topic.value} color="primary" />
                  </Grid>
                );
              })}
            </Grid>
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
