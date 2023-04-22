import axios from "axios";
import { useQuery } from "react-query";
import { BASE_URL } from "../services/common";
import { errorToast } from "../utils/toasts";
import { getConfig } from "./helper";
import useStoreCourse from "./useStoreCourse";
import useStoreToken from "./useStoreToken";
import Debug from "debug";

const debug = new Debug(`hourly:hooks:useQueryTopicCounts.js`);

function useQueryTopicCounts() {
  const queryKey = ["topicCounts"];
  const token = useStoreToken((state) => state.token);
  const course = useStoreCourse((state) => state.course);

  const getTopicCounts = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/api/course/${course.id}/topicCounts`,
        getConfig(token)
      );
      debug("Getting topic counts for a course.");
      return res.data;
    } catch (err) {
      debug({ err });
      errorToast(err);
      throw err;
    }
  };

  return {
    ...useQuery(queryKey, getTopicCounts),
  };
}

export default useQueryTopicCounts;
