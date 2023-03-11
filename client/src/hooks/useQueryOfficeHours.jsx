import axios from "axios";
import { useQuery } from "react-query";
import { BASE_URL } from "../services/common";
import { getConfig } from "./helper";
import useStoreCourse from "./useStoreCourse";
import useStoreToken from "./useStoreToken";

function useQueryOfficeHours() {
  const queryKey = ["officeHours"];
  const token = useStoreToken((state) => state.token);
  const course = useStoreCourse((state) => state.course);

  const getOfficeHours = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/api/course/${course.id}/officeHours`,
        getConfig(token)
      );
      console.log(res.data);
      return res.data;
    } catch (err) {
      throw err;
    }
  };

  return {
    ...useQuery(queryKey, getOfficeHours),
  };
}

export default useQueryOfficeHours;
