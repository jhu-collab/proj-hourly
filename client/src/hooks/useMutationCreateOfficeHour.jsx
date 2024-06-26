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
import useStoreLayout from "./useStoreLayout";
import Debug from "debug";

const debug = new Debug(`hourly:hooks:useMutationCreateOfficeHour.jsx`);

function useMutationCreateOfficeHour() {
  const { token } = useStoreToken();
  const queryClient = useQueryClient();

  const theme = useTheme();
  const matchUpSm = useMediaQuery(theme.breakpoints.up("sm"));

  const setAnchorEl = useStoreLayout((state) => state.setEventAnchorEl);

  const createOfficeHour = async (officeHour) => {
    try {
      debug("Sending office hour to be created to the backend...");
      const endpoint = `${BASE_URL}/api/officeHour/create`;
      const res = await axios.post(endpoint, officeHour, getConfig(token));
      debug("Successful! Returning result data...");
      return res.data;
    } catch (err) {
      throw err;
    }
  };

  const mutation = useMutation(createOfficeHour, {
    onSuccess: (data) => {
      const officeHour = data.officeHour;

      const startTime = DateTime.fromISO(officeHour.startDate).toLocaleString(
        DateTime.TIME_SIMPLE
      );
      const endTime = DateTime.fromISO(officeHour.endDate).toLocaleString(
        DateTime.TIME_SIMPLE
      );

      const startDate = DateTime.fromISO(officeHour.startDate).toFormat("D");
      const endDate = DateTime.fromISO(officeHour.endDate).toFormat("D");

      queryClient.invalidateQueries(["officeHours"]);
      NiceModal.hide("upsert-event");
      matchUpSm ? setAnchorEl() : NiceModal.hide("mobile-event-popup");

      if (startDate !== endDate) {
        toast.success(
          `Successfully created recurring office hours between ${startDate} and ${endDate} from 
             ${startTime} to ${endTime}`
        );
      } else {
        toast.success(
          `Successfully created office hour on ${startDate} from 
             ${startTime} to ${endTime}`
        );
      }
    },
    onError: (err) => {
      debug( {err} );
      errorToast(err);
    },
  });

  return {
    ...mutation,
  };
}

export default useMutationCreateOfficeHour;
