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
import Debug from "debug";

const debug = new Debug(`hourly:hooks:useMutationCancelRegistration.jsx`);

function useMutationCancelRegistration(registrationId) {
  const { token } = useStoreToken();
  const queryClient = useQueryClient();

  const theme = useTheme();
  const matchUpSm = useMediaQuery(theme.breakpoints.up("sm"));

  const setAnchorEl = useStoreLayout((state) => state.setEventAnchorEl);

  const cancelRegistration = async () => {
    try {
      debug("Attempting to cancel registration...");
      const endpoint = `${BASE_URL}/api/officeHour/cancelRegistration/${registrationId}`;
      const res = await axios.post(endpoint, {}, getConfig(token));
      debug("Successful! Returning result data...");
      return res.data;
    } catch (err) {
      throw err;
    }
  };

  const mutation = useMutation(cancelRegistration, {
    onSuccess: (data) => {
      const registration = data.registration;
      const startObj = new Date(registration.date);
      const startTimeObj = new Date(registration.startTime);
      if (startTimeObj.getUTCHours() < startObj.getTimezoneOffset() / 60) {
        startObj.setUTCDate(startObj.getUTCDate() + 1);
      }
      const startTime = DateTime.fromISO(
        startObj.toISOString().substring(0, 10) +
          registration.startTime.substring(10)
      ).toLocaleString(DateTime.TIME_SIMPLE);
      const endTime = DateTime.fromISO(
        startObj.toISOString().substring(0, 10) +
          registration.endTime.substring(10)
      ).toLocaleString(DateTime.TIME_SIMPLE);
      queryClient.invalidateQueries(["registrationStatus"]);
      queryClient.invalidateQueries(["allRegistrations"]);

      matchUpSm ? setAnchorEl() : NiceModal.hide("mobile-event-popup");

      toast.success(
        `Successfully cancelled registration from ${startTime} to ${endTime}`
      );
    },
    onError: (error) => {
      debug({ error });
      errorToast(error);
    },
  });

  return {
    ...mutation,
  };
}

export default useMutationCancelRegistration;
