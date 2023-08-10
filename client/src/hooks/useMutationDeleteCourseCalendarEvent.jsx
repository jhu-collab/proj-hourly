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
import useStoreCourse from "./useStoreCourse";

const debug = new Debug(
  `hourly:hooks:useMutationDeleteCourseCalendarEvent.jsx`
);

function useMutationDeleteCourseCalendarEvent(deleteType) {
  const { token } = useStoreToken();
  const queryClient = useQueryClient();

  let date = useStoreEvent((state) => state.start);
  date = date.toISOString().split("T")[0];

  const theme = useTheme();
  const matchUpSm = useMediaQuery(theme.breakpoints.up("sm"));

  const setAnchorEl = useStoreLayout((state) => state.setEventAnchorEl);

  const course = useStoreCourse((state) => state.course);
  const id = course.id;

  const deleteOnDate = async () => {
    try {
      debug("Sending course calendar event to be deleted to the backend...");
      const endpoint = `${BASE_URL}/api/calendarEvent/deleteCourse/${id}/date/${date}`;
      const res = await axios.delete(endpoint, getConfig(token));
      debug("Successful! Returning result data...");
      return res.data;
    } catch (err) {
      throw err;
    }
  };

  const deleteAll = async () => {
    try {
      debug(
        "Sending course ID to cancel all course calendar event occurrences to the backend..."
      );
      const endpoint = `${BASE_URL}/api/calendarEvent/deleteCourse/${id}`;
      const res = await axios.delete(endpoint, getConfig(token));
      debug("Successful! Returning result data...");
      return res.data;
    } catch (err) {
      throw err;
    }
  };

  const mutation = useMutation(
    deleteType === "this" ? deleteOnDate : deleteAll,
    {
      onSuccess: (data) => {
        date = DateTime.fromISO(date).toLocaleString(DateTime.DATE_SHORT);

        queryClient.invalidateQueries(["courseEvents"]);

        matchUpSm ? setAnchorEl() : NiceModal.hide("mobile-event-popup");

        deleteType === "all"
          ? toast.success("Successfully deleted all lecture events")
          : toast.success(`Successfully deleted lecture event on ${date}`);
      },
      onError: (error) => {
        debug({ error });
        errorToast(error);
      },
    }
  );

  return {
    ...mutation,
  };
}

export default useMutationDeleteCourseCalendarEvent;
