import axios from "axios";
import { useQuery } from "react-query";
import { BASE_URL } from "../services/common";
import { getConfig } from "./helper";
import useStoreCourse from "./useStoreCourse";
import useStoreToken from "./useStoreToken";

function useQueryRegistrations() {
  const queryKey = ["allRegistrations"];
  const token = useStoreToken((state) => state.token);
  const course = useStoreCourse((state) => state.course);

  const getAllRegistrations = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/api/course/${course.id}/getAllRegistrations`,
        getConfig(token)
      );
      return res.data;
    } catch (err) {
      throw err;
    }
  };

  return {
    ...useQuery(queryKey, getAllRegistrations),
  };
}

export default useQueryRegistrations;
