import axios from "axios";
import { useQuery } from "react-query";
import { BASE_URL } from "../services/common";
import { getConfig } from "./helper";
import Debug from "debug";
import useStoreCourse from "./useStoreCourse";
import useStoreToken from "./useStoreToken";

const debug = new Debug(`hourly:hooks:useQueryOfficeHours.jsx`);

function useQueryOfficeHours() {
  const queryKey = ["officeHours"];
  const token = useStoreToken((state) => state.token);
  const course = useStoreCourse((state) => state.course);

  const getOfficeHours = async () => {
    try {
      debug("Getting office hours for this course from backend.");
      const res = await axios.get(
        `${BASE_URL}/api/course/${course.id}/officeHours`,
        getConfig(token)
      );
      return res.data;
    } catch (err) {
      debug({ err });
      throw err;
    }
  };

  return {
    ...useQuery(queryKey, getOfficeHours),
  };
}

export default useQueryOfficeHours;
