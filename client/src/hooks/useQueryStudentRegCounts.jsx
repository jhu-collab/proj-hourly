import axios from "axios";
import { useQuery } from "react-query";
import { BASE_URL } from "../services/common";
import { getConfig } from "./helper";
import useStoreCourse from "./useStoreCourse";
import useStoreToken from "./useStoreToken";
import Debug from "debug";


const debug = new Debug(`hourly:hooks:useQueryStudentRegCounts.js`);

function useQueryStudentRegCounts() {
  const queryKey = ["studentRegistrationCounts"];
  const token = useStoreToken((state) => state.token);
  const course = useStoreCourse((state) => state.course);

  const getRegistrationCounts = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/api/course/${course.id}/studentRegistrationCounts`,
        getConfig(token)
      );
      debug("Getting stu Reg counts from backend.");
      return res.data;
    } catch (err) {
      debug({ err });
      throw err;
    }
  };

  return {
    ...useQuery(queryKey, getRegistrationCounts),
  };
}

export default useQueryStudentRegCounts;
