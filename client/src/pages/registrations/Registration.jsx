import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import DownOutlined from "@ant-design/icons/DownOutlined";
import { DateTime } from "luxon";
import ConfirmPopup, { confirmDialog } from "../../components/ConfirmPopup";
import useMutationCancelRegistration from "../../hooks/useMutationCancelRegistration";
import useStoreLayout from "../../hooks/useStoreLayout";
import { decodeToken } from "react-jwt";
import useStoreToken from "../../hooks/useStoreToken";
import useMutationChangeNoShowStatus from "../../hooks/useMutationChangeNoShowStatus";

/**
 * Represents a single Registration card.
 * @param {*} registration registration object
 * @param {Number} type a number that represents the type of
 *                      registrations. 0 for upcoming. 1 for
 *                      ongoing. 2 for past.
 * @returns a single Registration component.
 */
function Registration({ registration, type }) {
  // cancel and no-show will never be options as the same time
  const { mutate, isLoading: isLoadingMutate } = type === 0 ? 
    useMutationCancelRegistration(registration.id || -1) : 
    useMutationChangeNoShowStatus(registration.id || -1);

  const courseType = useStoreLayout((state) => state.courseType);
  const token = useStoreToken((state) => state.token);
  let isHost = false;
  const isNoShow = registration.isNoShow;

  const { id } = decodeToken(token);

  if (registration.officeHour.hosts.some((e) => e.id === id)) {
    isHost = true;
  }

  const onCancelClick = () => {
    confirmDialog("Do you really want to cancel this registration?", () =>
      mutate()
    );
  };

  const onNoShowClick = () => {
    confirmDialog("Do you really want to change this student's no-show status?", () =>
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
          {/* Date and Time */}
          <Stack direction="row" spacing={5}>
            <Typography fontWeight={600} color={isNoShow ? "error.main" : "text.primary"}>
              {DateTime.fromISO(
                registration.date.substring(0, 10) +
                  registration.startTime.substring(10)
              ).toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY)}
            </Typography>
            <Typography fontWeight={600} color={isNoShow ? "error.main" : "text.primary"}>
              {DateTime.fromISO(registration.startTime).toLocaleString(
                DateTime.TIME_SIMPLE
              )}{" "}
              -{" "}
              {DateTime.fromISO(registration.endTime).toLocaleString(
                DateTime.TIME_SIMPLE
              )}
            </Typography>
          </Stack>
          {/* Host (display only for instructors and students) and Student (display only for staff) */}
          <Stack direction="row" spacing={5}>
            {(courseType === "Instructor" || courseType === "Student") && (
              <Typography color={isHost ? "info.main" : "text.primary"}>
                Host:{" "}
                <strong>
                  {registration.officeHour.hosts[0].firstName}{" "}
                  {registration.officeHour.hosts[0].lastName}
                </strong>
              </Typography>
            )}
            {(courseType === "Instructor" || courseType === "Staff") && (
              <Typography color={isNoShow ? "error.main" : "text.primary"}>
                Student:{" "}
                <strong>
                  {registration.account.firstName}{" "}
                  {registration.account.lastName}
                </strong>
              </Typography>
            )}
          </Stack>
        </Stack>
      </AccordionSummary>
      <AccordionDetails sx={{ pr: 5 }}>
        {/* TODO: Depending on what type of booking this event has been made for,
         details about the event will be provided here */}
        <>
          <Stack direction="row" justifyContent="space-between">
            <Box>
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
            </Box>
            <Typography>
              Type: <strong>{registration.type}</strong>
            </Typography>
          </Stack>
          {registration.question !== "" && (
            <>
              <Typography fontWeight={600}>Additional Notes:</Typography>
              <Typography marginBottom={4}>{registration.question}</Typography>
            </>
          )}
          {type === 2 && 
            (isHost || courseType === "Instructor") && (
              <>
                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  onClick={onNoShowClick}
                >
                  {isNoShow ? "Mark as Present" : "Mark as No-Show"}
                </Button>
                <ConfirmPopup />
              </>
            )}
          {type === 0 &&
            (isHost ||
              courseType === "Student" ||
              courseType === "Instructor") && (
              <>
                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  onClick={onCancelClick}
                >
                  Cancel
                </Button>
                <ConfirmPopup />
              </>
            )}
        </>
      </AccordionDetails>
    </Accordion>
  );
}

export default Registration;
