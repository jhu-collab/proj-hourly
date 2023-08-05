import axios from "axios";
import { useQuery } from "react-query";
import { BASE_URL } from "../services/common";
import { getConfig } from "./helper";
import Debug from "debug";
import useStoreCourse from "./useStoreCourse";
import useStoreToken from "./useStoreToken";

const debug = new Debug(`hourly:hooks:useQueryCourseEvents.jsx`);

function useQueryCourseEvents() {
  const queryKey = ["courseEvents"];
  const token = useStoreToken((state) => state.token);
  const course = useStoreCourse((state) => state.course);

  const getCourseEvents = async () => {
    try {
      debug("Getting course calendar events for this course from backend.");
      const res = await axios.get(
        `${BASE_URL}/api/calendarEvent/getAllEventsForCourse/${course.id}`,
        getConfig(token)
      );
      return res.data;
    } catch (err) {
      debug({ err });
      throw err;
    }
  };

  return {
    ...useQuery(queryKey, getCourseEvents),
  };
}

export default useQueryCourseEvents;