import axios from "axios";
import { useQuery } from "react-query";
import { BASE_URL } from "../services/common";
import { useCourseStore, useStoreToken } from "../services/store";
import { getConfig } from "./helper";

function useQueryOfficeHours() {
  const queryKey = ["officeHours"];
  const token = useStoreToken((state) => state.token);
  const course = useCourseStore((state) => state.course);

  const getOfficeHours = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/api/course/${course.id}/officeHours`,
        getConfig(token)
      );
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
