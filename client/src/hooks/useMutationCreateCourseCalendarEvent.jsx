import axios from "axios";
import { useMutation, useQueryClient } from "react-query";
import { errorToast } from "../utils/toasts";
import { getConfig } from "./helper";
import { toast } from "react-toastify";
import { BASE_URL } from "../services/common";
import useTheme from "@mui/material/styles/useTheme";
import useMediaQuery from "@mui/material/useMediaQuery";
import useStoreToken from "./useStoreToken";
import useStoreLayout from "./useStoreLayout";
import Debug from "debug";

const debug = new Debug(`hourly:hooks:useMutationCreateCourseCalendar.jsx`);

function useMutationCreateCourseCalendarEvent() {
  const { token } = useStoreToken();
  const queryClient = useQueryClient();

  const theme = useTheme();
  const matchUpSm = useMediaQuery(theme.breakpoints.up("sm"));

  const setAnchorEl = useStoreLayout((state) => state.setEventAnchorEl);

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

  // const createRecurringCourseCalendarEvent = async (courseEvent) => {
  //   try {
  //     debug("Sending recurring course calendar event to be created to the backend...");
  //     const endpoint = `${BASE_URL}/api/courseCalendar/createRecurringEvent`;
  //     const res = await axios.post(endpoint, courseEvent, getConfig(token));
  //     debug("Successful! Returning result data...");
  //     return res.data;
  //   } catch (err) {
  //     throw err;
  //   }
  // }

  const mutation = useMutation(createCourseCalendarEvent, {
    onSuccess: (data) => {
      const courseEvent = data;

      queryClient.invalidateQueries(["courseEvents"]);

      toast.success("Created recurring course calendar event!");
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
