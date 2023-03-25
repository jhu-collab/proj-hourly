import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import NiceModal from "@ebay/nice-modal-react";
import Alert from "@mui/material/Alert";
import ConfirmPopup, { confirmDialog } from "../../../components/ConfirmPopup";
import useQueryRegistrationStatus from "../../../hooks/useQueryRegistrationStatus";
import useMutationCancelRegistration from "../../../hooks/useMutationCancelRegistration";
import useStoreEvent from "../../../hooks/useStoreEvent";
import useQueryTimeSlots from "../../../hooks/useQueryTimeSlots";
import useQueryRegistrationTypes from "../../../hooks/useQueryRegistrationTypes";

/**
 * Child component that displays information about an office hour
 * that is relevant for student registration.
 * @returns a student registration information section
 */
function StudentDetails() {
  const { isLoading, error, data } = useQueryRegistrationStatus();

  const { mutate, isLoading: isLoadingMutate } = useMutationCancelRegistration(
    data?.registration?.id || -1
  );
  
  const { isLoading: isLoadingTimeSlots, data: timeSlots } = useQueryTimeSlots();
  const { isLoading: isLoadingRegTypes, data: dataRegTypes } = useQueryRegistrationTypes();

  const end = useStoreEvent((state) => state.end);
  const curDate = new Date();

  const getIsPastBookingWindow = () => {
    if (curDate.getTime() >= end.getTime()) {
      return true;
    }

    for (let i = 0; i < dataRegTypes.times.length; i++) {
      if (timeSlots.timeSlotsPerType[i].times.length > 0) {
        return false;
      }
    }

    return true;
  }

  if (isLoading || isLoadingMutate || isLoadingRegTypes || isLoadingTimeSlots) {
    return <Alert severity="warning">Retrieving registration status ...</Alert>;
  }

  if (error) {
    return (
      <Alert severity="error">Unable to retrieve registration status</Alert>
    );
  }

  const isRegistered = data.status === "Registered";
  const isPastBookingWindow = getIsPastBookingWindow();

  const onClick = () => {
    isRegistered
      ? confirmDialog("Do you really want to cancel this registration?", () =>
          mutate()
        )
      : NiceModal.show("register-event");
  };

  return (
    <>
      <Stack alignItems="center" spacing={2}>
        <Typography color={isRegistered ? "green" : "red"} paddingX={2}>
          {isRegistered
            ? `You are currently registered for this session`
            : (isPastBookingWindow ? `This session is not within the booking window` : `You are not registered for this session`)}
        </Typography>
        <Button
          variant="contained"
          fullWidth
          sx={{ borderRadius: 0 }}
          color={isRegistered ? "error" : "primary"}
          disabled={isPastBookingWindow}
          onClick={onClick}
        >
          {isRegistered ? `Cancel` : `Sign Up`}
        </Button>
      </Stack>
      <ConfirmPopup />
    </>
  );
}

export default StudentDetails;
