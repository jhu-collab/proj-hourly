import axios from "axios";
import { useMutation, useQueryClient } from "react-query";
import { errorToast } from "../utils/toasts";
import { getConfig } from "./helper";
import NiceModal from "@ebay/nice-modal-react";
import { toast } from "react-toastify";
import {
  useEventStore,
  useLayoutStore,
  useStoreToken,
} from "../services/store";
import { BASE_URL } from "../services/common";
import useTheme from "@mui/material/styles/useTheme";
import useMediaQuery from "@mui/material/useMediaQuery";
import moment from "moment";

function useMutationEditEvent(recurringEvent) {
  const { token } = useStoreToken();
  const queryClient = useQueryClient();

  const date = moment(useEventStore((state) => state.start)).format(
    "MM-DD-YYYY"
  );
  const id = useEventStore((state) => state.id);

  const theme = useTheme();
  const matchUpSm = useMediaQuery(theme.breakpoints.up("sm"));

  const setAnchorEl = useLayoutStore((state) => state.setEventAnchorEl);

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
