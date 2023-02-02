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
import useMutationCancelRegistration from "../../hooks/useMutationCancelRegistration";

/**
 * Represents a single Registration card.
 * @param {*} registration registration object
 * @param {Number} type a number that represents the type of
 *                      registrations. 0 for upcoming. 1 for
 *                      ongoing. 2 for past.
 * @returns a single Registration component.
 */
function Registration({ registration, type }) {
  const { mutate, isLoading: isLoadingMutate } = useMutationCancelRegistration(
    registration.id || -1
  );

  const onClick = () => {
    confirmDialog("Do you really want to cancel this registration?", () =>
      mutate()
    );
  };

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
            {DateTime.fromISO(
              registration.date.substring(0, 10) +
                registration.startTime.substring(10)
            ).toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY)}
          </Typography>
          <Typography fontWeight={600}>
            {DateTime.fromISO(registration.startTime).toLocaleString(
              DateTime.TIME_SIMPLE
            )}{" "}
            -{" "}
            {DateTime.fromISO(registration.endTime).toLocaleString(
              DateTime.TIME_SIMPLE
            )}
          </Typography>
          <Typography>
            Type: <strong>{registration.type}</strong>
          </Typography>
        </Stack>
      </AccordionSummary>
      <AccordionDetails sx={{ pr: 5 }}>
        {/* TODO: Depending on what type of booking this event has been made for,
         details about the event will be provided here */}
        {type === 0 && (
          <>
            <Typography fontWeight={600}>Selected Topics:</Typography>
            {registration.topics.length === 0 ? (
              <Typography marginBottom={4}>None</Typography>
            ) : (
              <Grid container spacing={1} marginBottom={4}>
                {registration.topics.map((topic) => {
                  return (
                    <Grid item key={topic.id}>
                      <Chip label={topic.value} />
                    </Grid>
                  );
                })}
              </Grid>
            )}
            <Button
              variant="contained"
              size="large"
              fullWidth
              onClick={onClick}
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
