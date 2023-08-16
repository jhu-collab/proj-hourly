import axios from "axios";
import { useMutation, useQueryClient } from "react-query";
import { errorToast } from "../utils/toasts";
import { getConfig } from "./helper";
import { toast } from "react-toastify";
import { BASE_URL } from "../services/common";
import useStoreToken from "./useStoreToken";
import Debug from "debug";
import NiceModal from "@ebay/nice-modal-react";

const debug = new Debug(
  `hourly:hooks:useMutationCreateCourseCalendarEvent.jsx`
);

function useMutationCreateCourseCalendarEvent(createType) {
  const { token } = useStoreToken();
  const queryClient = useQueryClient();

  const createCourseCalendarEvent = async (courseEvent) => {
    try {
      debug("Sending course calendar event to be created to the backend...");
      const endpoint = `${BASE_URL}/api/calendarEvent/createEvent`;
      const res = await axios.post(endpoint, courseEvent, getConfig(token));
      debug("Successful! Returning result data...");
      return res.data;
    } catch (err) {
      throw err;
    }
  };
  
  const createCourseCalendarEvents = async (courseEvent) => {
    try {
      debug("Sending course calendar events to be created to the backend...");
      const endpoint = `${BASE_URL}/api/calendarEvent/create`;
      const res = await axios.post(endpoint, courseEvent, getConfig(token));
      debug("Successful! Returning result data...");
      return res.data;
    } catch (err) {
      throw err;
    }
  };

  const mutation = useMutation(
    createType === "many" ? createCourseCalendarEvents : createCourseCalendarEvent, {
    onSuccess: (data) => {
      const courseEvent = data;

      queryClient.invalidateQueries(["courseEvents"]);
      NiceModal.hide("create-course-calendar-event");

      toast.success("Successfully created course calendar events!");
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

export default useMutationCreateCourseCalendarEvent;
