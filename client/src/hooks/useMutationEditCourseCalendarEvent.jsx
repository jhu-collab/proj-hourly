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

const debug = new Debug(`hourly:hooks:useMutationEditCourseCalendarEvent.jsx`);

function useMutationEditCourseCalendarEvent(recurringEvent) {
  const { token } = useStoreToken();
  const queryClient = useQueryClient();

  const start = useStoreEvent((state) => state.start);
  const date = DateTime.fromJSDate(start, { zone: "utc" }).toFormat(
    "MM/dd/yyyy"
  );

  const theme = useTheme();
  const matchUpSm = useMediaQuery(theme.breakpoints.up("sm"));

  const setAnchorEl = useStoreLayout((state) => state.setEventAnchorEl);

  const editCourseEventOnDate = async (courseEvent) => {
    try {
      debug(
        "Sending course calendar event to edit one occurrence to the backend..."
      );
      const endpoint = `${BASE_URL}/api/calendarEvent/edit`;
      const res = await axios.post(endpoint, courseEvent, getConfig(token));
      debug("Successful! Returning result data...");
      return res.data;
    } catch (err) {
      throw err;
    }
  };

  const mutation = useMutation(editCourseEventOnDate, {
    onSuccess: (data) => {
      queryClient.invalidateQueries(["courseEvents"]);
      NiceModal.hide("upsert-event");
      matchUpSm ? setAnchorEl() : NiceModal.hide("mobile-event-popup");

      toast.success(`Successfully edited course calendar event on ${date}!`);
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

export default useMutationEditCourseCalendarEvent;
