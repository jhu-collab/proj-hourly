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

function useMutationEditEvent(recurringEvent) {
  const { token } = useStoreToken();
  const queryClient = useQueryClient();

  const start = useStoreEvent((state) => state.start);
  const date = DateTime.fromJSDate(start, {zone: "utc"}).toFormat("MM-dd-yyyy");

  const id = useStoreEvent((state) => state.id);

  const theme = useTheme();
  const matchUpSm = useMediaQuery(theme.breakpoints.up("sm"));

  const setAnchorEl = useStoreLayout((state) => state.setEventAnchorEl);

  const editEventAll = async (officeHour) => {
    try {
      const endpoint = `${BASE_URL}/api/officeHour/${id}/editAll`;
      const res = await axios.post(endpoint, officeHour, getConfig(token));
      return res.data;
    } catch (err) {
      throw err;
    }
  };

  const editEventOnDate = async (officeHour) => {
    try {
      const endpoint = `${BASE_URL}/api/officeHour/${id}/editForDate/${date}`;
      const res = await axios.post(endpoint, officeHour, getConfig(token));
      return res.data;
    } catch (err) {
      throw err;
    }
  };

  const mutation = useMutation(
    recurringEvent ? editEventAll : editEventOnDate,
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries(["officeHours"]);
        NiceModal.hide("upsert-event");
        matchUpSm ? setAnchorEl() : NiceModal.hide("mobile-event-popup");

        toast.success(`Successfully edited event`);
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

export default useMutationEditEvent;
