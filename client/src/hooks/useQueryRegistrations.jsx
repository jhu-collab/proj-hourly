import axios from "axios";
import { useQuery } from "react-query";
import { BASE_URL } from "../services/common";
import { getConfig } from "./helper";
import Debug from "debug";
import useStoreCourse from "./useStoreCourse";
import useStoreToken from "./useStoreToken";

const debug = new Debug(`hourly:hooks:useQueryRegistrations.js`);

function useQueryRegistrations() {
  const queryKey = ["allRegistrations"];
  const token = useStoreToken((state) => state.token);
  const course = useStoreCourse((state) => state.course);

  const getAllRegistrations = async () => {
    try {
      debug("Getting all registrations from backend.");
      const res = await axios.get(
        `${BASE_URL}/api/course/${course.id}/getAllRegistrations`,
        getConfig(token)
      );
      return res.data;
    } catch (err) {
      debug({ err });
      throw err;
    }
  };

  return {
    ...useQuery(queryKey, getAllRegistrations),
  };
}

export default useQueryRegistrations;
