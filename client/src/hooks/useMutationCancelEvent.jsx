import axios from "axios";
import { useMutation, useQueryClient } from "react-query";
import { errorToast } from "../utils/toasts";
import { getConfig } from "./helper";
import NiceModal from "@ebay/nice-modal-react";
import { toast } from "react-toastify";
import { BASE_URL } from "../services/common";
import useTheme from "@mui/material/styles/useTheme";
import useMediaQuery from "@mui/material/useMediaQuery";
import { DateTime } from "luxon";
import useStoreToken from "./useStoreToken";
import useStoreEvent from "./useStoreEvent";
import useStoreLayout from "./useStoreLayout";
import Debug from "debug";

const debug = new Debug(`hourly:hooks:useMutationCancelEvent.jsx`);

function useMutationCancelEvent(deleteType) {
  const { token } = useStoreToken();
  const queryClient = useQueryClient();

  const recurring = useStoreEvent((state) => state.recurring);

  const theme = useTheme();
  const matchUpSm = useMediaQuery(theme.breakpoints.up("sm"));

  const setAnchorEl = useStoreLayout((state) => state.setEventAnchorEl);

  const cancelOnDate = async (event) => {
    try {
      debug("Sending event to be cancelled to the backend...");
      const endpoint = `${BASE_URL}/api/officeHour/cancelOnDate`;
      const res = await axios.post(endpoint, event, getConfig(token));
      debug("Successful! Returning result data...");
      return res.data;
    } catch (err) {
      throw err;
    }
  };

  const cancelAll = async (event) => {
    try {
      debug("Sending office hour ID to cancel all event occurrences to the backend...");
      const endpoint = `${BASE_URL}/api/officeHour/cancelAll`;
      const res = await axios.post(
        endpoint,
        { officeHourId: event.officeHourId },
        getConfig(token)
      );
      debug("Successful! Returning result data...");
      return res.data;
    } catch (err) {
      throw err;
    }
  };

  const mutation = useMutation(
    recurring && deleteType === "this" ? cancelOnDate : cancelAll,
    {
      onSuccess: (data) => {
        const officeHour = data.officeHourUpdate;

        const date = DateTime.fromISO(officeHour.startDate).toLocaleString();
        const startTime = DateTime.fromISO(officeHour.startDate).toLocaleString(
          DateTime.TIME_SIMPLE
        );
        const endTime = DateTime.fromISO(officeHour.endDate).toLocaleString(
          DateTime.TIME_SIMPLE
        );

        queryClient.invalidateQueries(["officeHours"]);

        matchUpSm ? setAnchorEl() : NiceModal.hide("mobile-event-popup");

        recurring && deleteType === "all"
          ? toast.success(
              `Successfully deleted all events from 
         ${startTime} to ${endTime}`
            )
          : toast.success(
              `Successfully deleted event on ${date} from 
         ${startTime} to ${endTime}`
            );
      },
      onError: (error) => {
        debug( {error} );
        errorToast(error);
      },
    }
  );

  return {
    ...mutation,
  };
}

export default useMutationCancelEvent;
