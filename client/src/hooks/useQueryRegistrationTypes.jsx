import axios from "axios";
import { useQuery } from "react-query";
import { BASE_URL } from "../services/common";
import { getConfig } from "./helper";
import Debug from "debug";
import useStoreCourse from "./useStoreCourse";
import useStoreToken from "./useStoreToken";

const debug = new Debug(`hourly:hooks:useQueryRegistrationTypes.js`);

function useQueryRegistrationTypes() {
  const queryKey = ["registrationTypes"];
  const token = useStoreToken((state) => state.token);

  const course = useStoreCourse((state) => state.course);

  const getRegistrationTypes = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/api/course/${course.id}/officeHourTimeInterval`,
        getConfig(token)
      );
      debug("Getting office hour time interval from backend.");
      return res.data;
    } catch (err) {
      debug({ err });
      throw err;
    }
  };

  return {
    ...useQuery(queryKey, getRegistrationTypes),
  };
}

export default useQueryRegistrationTypes;
