import axios from "axios";
import { useMutation, useQueryClient } from "react-query";
import { errorToast } from "../utils/toasts";
import { getConfig } from "./helper";
import NiceModal from "@ebay/nice-modal-react";
import { toast } from "react-toastify";
import { BASE_URL } from "../services/common";
import useTheme from "@mui/material/styles/useTheme";
import useMediaQuery from "@mui/material/useMediaQuery";
import useStoreToken from "./useStoreToken";
import useStoreLayout from "./useStoreLayout";
import { DateTime } from "luxon";

function useMutationCancelRegistration(registrationId) {
  const { token } = useStoreToken();
  const queryClient = useQueryClient();

  const theme = useTheme();
  const matchUpSm = useMediaQuery(theme.breakpoints.up("sm"));

  const setAnchorEl = useStoreLayout((state) => state.setEventAnchorEl);

  const cancelRegistration = async () => {
    try {
      const endpoint = `${BASE_URL}/api/officeHour/cancelRegistration/${registrationId}`;
      const res = await axios.post(endpoint, {}, getConfig(token));
      return res.data;
    } catch (err) {
      throw err;
    }
  };

  const mutation = useMutation(cancelRegistration, {
    onSuccess: (data) => {
      const registration = data.registration;
      const startTime = DateTime.fromISO(registration.startTime).toLocaleString(
        DateTime.TIME_SIMPLE
      );
      const endTime = DateTime.fromISO(registration.endTime).toLocaleString(
        DateTime.TIME_SIMPLE
      );

      queryClient.invalidateQueries(["registrationStatus"]);
      queryClient.invalidateQueries(["allRegistrations"]);

      matchUpSm ? setAnchorEl() : NiceModal.hide("mobile-event-popup");

      toast.success(
        `Successfully cancelled registration from ${startTime} to ${endTime}`
      );
    },
    onError: (error) => {
      errorToast(error);
    },
  });

  return {
    ...mutation,
  };
}

export default useMutationCancelRegistration;
