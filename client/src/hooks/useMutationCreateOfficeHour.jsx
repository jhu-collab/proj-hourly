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

function useMutationCreateOfficeHour() {
  const { token } = useStoreToken();
  const queryClient = useQueryClient();

  const theme = useTheme();
  const matchUpSm = useMediaQuery(theme.breakpoints.up("sm"));

  const setAnchorEl = useStoreLayout((state) => state.setEventAnchorEl);

  const createOfficeHour = async (officeHour) => {
    try {
      const endpoint = `${BASE_URL}/api/officeHour/create`;
      const res = await axios.post(endpoint, officeHour, getConfig(token));
      return res.data;
    } catch (err) {
      throw err;
    }
  };

  const mutation = useMutation(createOfficeHour, {
    onSuccess: (data) => {
      const officeHour = data.officeHour;
      const date = DateTime.fromISO(officeHour.startDate, {
        zone: "utc",
      }).toFormat("D");
      const startTime = DateTime.fromISO(officeHour.startTime, {
        zone: "utc",
      }).toLocaleString(DateTime.TIME_SIMPLE);
      const endTime = DateTime.fromISO(officeHour.endTime, {
        zone: "utc",
      }).toLocaleString(DateTime.TIME_SIMPLE);

      queryClient.invalidateQueries(["officeHours"]);
      NiceModal.hide("upsert-event");
      matchUpSm ? setAnchorEl() : NiceModal.hide("mobile-event-popup");

      // TODO: Will need to be refactored once we deal with recurring events.
      toast.success(
        `Successfully created office hour on ${date} from 
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

export default useMutationCreateOfficeHour;
