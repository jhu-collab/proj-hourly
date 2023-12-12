import axios from "axios";
import { useQuery } from "react-query";
import { BASE_URL } from "../services/common";
import { getConfig } from "./helper";
import Debug from "debug";
import useStoreCourse from "./useStoreCourse";
import useStoreToken from "./useStoreToken";

const debug = new Debug(`hourly:hooks:useQueryGetRegistrationFeedback.js`);

function useQueryGetRegistrationFeedback() {
  const queryKey = ["allFeedback"];
  const token = useStoreToken((state) => state.token);
  const course = useStoreCourse((state) => state.course);

  const getAllRegistrations = async () => {
    try {
      debug("Getting all feedback from backend.");
      const res = await axios.get(
        `${BASE_URL}/api/officeHour/${course.id}/getRegistrationFeedback`,
        getConfig(token)
      );
      return res.data.feedbacks;
    } catch (err) {
      debug({ err });
      throw err;
    }
  };

  return {
    ...useQuery(queryKey, getAllRegistrations),
  };
}

export default useQueryGetRegistrationFeedback;
