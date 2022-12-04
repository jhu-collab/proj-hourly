import axios from "axios";
import { useMutation, useQueryClient } from "react-query";
import { errorToast } from "../utils/toasts";
import { getConfig } from "./helper";
import NiceModal from "@ebay/nice-modal-react";
import { toast } from "react-toastify";
import { BASE_URL } from "../services/common";
import { DateTime } from "luxon";
import useTheme from "@mui/material/styles/useTheme";
import useMediaQuery from "@mui/material/useMediaQuery";
import useStoreToken from "./useStoreToken";
import useStoreLayout from "./useStoreLayout";

function useMutationRegister() {
  const { token } = useStoreToken();

  const queryClient = useQueryClient();

  const theme = useTheme();
  const matchUpSm = useMediaQuery(theme.breakpoints.up("sm"));

  const setAnchorEl = useStoreLayout((state) => state.setEventAnchorEl);

  const register = async (officeHour) => {
    try {
      const endpoint = `${BASE_URL}/api/officeHour/register`;
      const res = await axios.post(endpoint, officeHour, getConfig(token));
      return res.data;
    } catch (err) {
      throw err;
    }
  };

  const mutation = useMutation(register, {
    onSuccess: (data) => {
      const registration = data.registration;

      const date = DateTime.fromISO(registration.date).toLocaleString();
      const startTime = DateTime.fromISO(registration.startTime).toLocaleString(
        DateTime.TIME_SIMPLE
      );
      const endTime = DateTime.fromISO(registration.endTime).toLocaleString(
        DateTime.TIME_SIMPLE
      );

      queryClient.invalidateQueries(["studentRegistrationCounts"]);
      queryClient.invalidateQueries(["topicCounts"]);

      NiceModal.hide("register-event");
      matchUpSm ? setAnchorEl() : NiceModal.hide("mobile-event-popup");
      toast.success(
        `Successfully registered for session on ${date} from 
           ${startTime} to ${endTime}`
      );
    },
    onError: (err) => {
      errorToast(err);
    },
  });

  return {
    ...mutation,
  };
}

export default useMutationRegister;
