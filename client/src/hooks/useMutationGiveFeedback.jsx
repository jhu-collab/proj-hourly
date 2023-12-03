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
import Debug from "debug";

const debug = new Debug(`hourly:hooks:useMutationGiveFeedback.jsx`);

function useMutationGiveFeedback() {
  const { token } = useStoreToken();

  const queryClient = useQueryClient();

  const theme = useTheme();
  const matchUpSm = useMediaQuery(theme.breakpoints.up("sm"));

  const setAnchorEl = useStoreLayout((state) => state.setEventAnchorEl);

  const register = async (feedback) => {
    try {
      debug("Sending office hour to give feedback for to the backend...");
      const endpoint = `${BASE_URL}/api/officeHour/addRegistrationFeedback`;
      const res = await axios.post(endpoint, feedback, getConfig(token));
      debug("Successful! Returning result data...");
      return res.data;
    } catch (err) {
      throw err;
    }
  };

  const mutation = useMutation(register, {
    onSuccess: (data) => {
      const feedback = data.feedback;
      NiceModal.hide("create-feedback");
      queryClient.invalidateQueries(["allRegistrations"]);
      //   matchUpSm ? setAnchorEl() : NiceModal.hide("mobile-event-popup");
      toast.success(`Successfully given feedback!`);
    },
    onError: (err) => {
      debug({ err });
      errorToast(err);
    },
  });

  return {
    ...mutation,
  };
}

export default useMutationGiveFeedback;
