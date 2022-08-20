import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import NiceModal from "@ebay/nice-modal-react";
import Alert from "@mui/material/Alert";
import useMediaQuery from "@mui/material/useMediaQuery";
import useTheme from "@mui/material/styles/useTheme";
import { useQuery, useMutation, useQueryClient } from "react-query";
import {
  cancelRegistration,
  getRegistrationStatus,
} from "../../../utils/requests";
import { errorToast } from "../../../utils/toasts";
import ConfirmPopup, { confirmDialog } from "../../../components/ConfirmPopup";
import { toast } from "react-toastify";
import moment from "moment";
import { useLayoutStore } from "../../../services/store";

/**
 * Child component that displays information about an office hour
 * that is relevant for student registration.
 * @returns a student registration information section
 */
function StudentDetails() {
  const theme = useTheme();
  const matchUpSm = useMediaQuery(theme.breakpoints.up("sm"));
  const setAnchorEl = useLayoutStore((state) => state.setEventAnchorEl);

  const { isLoading, error, data } = useQuery(
    ["registrationStatus"],
    getRegistrationStatus
  );

  const { mutate, isLoading: isLoadingMutate } = useMutation(
    () => cancelRegistration(data.registration.id),
    {
      onSuccess: (data) => {
        const registration = data.registration;
        const startTime = moment(registration.startTime)
          .utc()
          .format("hh:mm A");
        const endTime = moment(registration.endTime).utc().format("hh:mm A");

        queryClient.invalidateQueries(["registrationStatus"]);

        matchUpSm ? setAnchorEl() : NiceModal.hide("mobile-event-popup");

        toast.success(
          `Successfully cancelled registration from ${startTime} to ${endTime}`
        );
      },
      onError: (error) => {
        errorToast(error);
      },
    }
  );

  const queryClient = useQueryClient();

  if (isLoading) {
    return <Alert severity="warning">Retrieving registration status ...</Alert>;
  }

  if (error) {
    return (
      <Alert severity="error">Unable to retrieve registration status</Alert>
    );
  }

  const isRegistered = data.status === "Registered";

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
            : `You are not registered for this session`}
        </Typography>
        <Button
          variant="contained"
          fullWidth
          sx={{ borderRadius: 0 }}
          color={isRegistered ? "error" : "primary"}
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
