import axios from "axios";
import { useQuery } from "react-query";
import { BASE_URL } from "../services/common";
import { getConfig } from "./helper";
import Debug from "debug";
import useStoreCourse from "./useStoreCourse";
import useStoreToken from "./useStoreToken";

const debug = new Debug(`hourly:hooks:useQueryCourseUsers.js`);

function useQueryCourseUsers() {
  const token = useStoreToken((state) => state.token);
  const course = useStoreCourse((state) => state.course);
  const queryKey = ["courseUsers", course.id];

  const getCourseUsers = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/api/course/${course.id}/getRoster`,
        getConfig(token)
      );
      debug("Get rosters from backend.");
      return res.data;
    } catch (err) {
      debug({ err });
      throw err;
    }
  };

  return {
    ...useQuery(queryKey, getCourseUsers),
  };
}

export default useQueryCourseUsers;
