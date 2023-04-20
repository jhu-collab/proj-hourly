import axios from "axios";
import { useQuery } from "react-query";
import { BASE_URL } from "../services/common";
import { errorToast } from "../utils/toasts";
import { getConfig } from "./helper";
import useStoreCourse from "./useStoreCourse";
import useStoreToken from "./useStoreToken";
import Debug from "debug";

const debug = new Debug(`hourly:hooks:useQueryTopics.js`);

function useQueryTopics() {
  const queryKey = ["topics"];
  const token = useStoreToken((state) => state.token);
  const course = useStoreCourse((state) => state.course);

  const getTopics = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/api/course/${course.id}/topics`,
        getConfig(token)
      );
      debug("Getting all topics.");
      return res.data;
    } catch (err) {
      errorToast(err);
      throw err;
    }
  };

  return {
    ...useQuery(queryKey, getTopics),
  };
}

export default useQueryTopics;
