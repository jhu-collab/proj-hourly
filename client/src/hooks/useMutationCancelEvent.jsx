import axios from "axios";
import { useMutation, useQueryClient } from "react-query";
import { errorToast } from "../utils/toasts";
import { getConfig } from "./helper";
import NiceModal from "@ebay/nice-modal-react";
import { toast } from "react-toastify";
import { BASE_URL } from "../services/common";
import useTheme from "@mui/material/styles/useTheme";
import useMediaQuery from "@mui/material/useMediaQuery";
import moment from "moment";
import useStoreToken from "./useStoreToken";
import useStoreEvent from "./useStoreEvent";
import useStoreLayout from "./useStoreLayout";

function useMutationCancelEvent(deleteType) {
  const { token } = useStoreToken();
  const queryClient = useQueryClient();

  const recurring = useStoreEvent((state) => state.recurring);

  const theme = useTheme();
  const matchUpSm = useMediaQuery(theme.breakpoints.up("sm"));

  const setAnchorEl = useStoreLayout((state) => state.setEventAnchorEl);

  const cancelOnDate = async (event) => {
    try {
      const endpoint = `${BASE_URL}/api/officeHour/cancelOnDate`;
      const res = await axios.post(endpoint, event, getConfig(token));
      return res.data;
    } catch (err) {
      throw err;
    }
  };

  const cancelAll = async (event) => {
    try {
      const endpoint = `${BASE_URL}/api/officeHour/cancelAll`;
      const res = await axios.post(endpoint, event, getConfig(token));
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

        const date = moment(officeHour.startDate).utc().format("L");
        const startTime = moment(officeHour.startTime).utc().format("LT");
        const endTime = moment(officeHour.endTime).utc().format("LT");

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
        errorToast(error);
      },
    }
  );

  return {
    ...mutation,
  };
}

export default useMutationCancelEvent;
