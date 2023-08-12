import axios from "axios";
import { useMutation, useQueryClient } from "react-query";
import { errorToast } from "../utils/toasts";
import { getConfig } from "./helper";
import { toast } from "react-toastify";
import { BASE_URL } from "../services/common";
import useStoreToken from "./useStoreToken";
import Debug from "debug";

const debug = new Debug(`hourly:hooks:useMutationCreateCourseCalendarEvent.jsx`);

function useMutationCreateCourseCalendarEvent() {
  const { token } = useStoreToken();
  const queryClient = useQueryClient();

  const createCourseCalendarEvent = async (courseEvent) => {
    console.log(courseEvent);
    try {
      debug("Sending course calendar event to be created to the backend...");
      const endpoint = `${BASE_URL}/api/calendarEvent/create`;
      const res = await axios.post(endpoint, courseEvent, getConfig(token));
      debug("Successful! Returning result data...");
      return res.data;
    } catch (err) {
      throw err;
    }
  };

  const mutation = useMutation(createCourseCalendarEvent, {
    onSuccess: (data) => {
      const courseEvent = data;

      queryClient.invalidateQueries(["courseEvents"]);

      toast.success("Created course calendar events!");
      console.log(courseEvent);
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
