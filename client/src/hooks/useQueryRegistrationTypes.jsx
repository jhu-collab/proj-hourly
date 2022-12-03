import axios from "axios";
import { useQuery } from "react-query";
import { BASE_URL } from "../services/common";
import { getConfig } from "./helper";
import useStoreCourse from "./useStoreCourse";
import useStoreToken from "./useStoreToken";

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
      return res.data;
    } catch (err) {
      throw err;
    }
  };

  return {
    ...useQuery(queryKey, getRegistrationTypes),
  };
}

export default useQueryRegistrationTypes;
