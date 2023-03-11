import axios from "axios";
import { useQuery } from "react-query";
import { BASE_URL } from "../services/common";
import { getConfig } from "./helper";
import useStoreCourse from "./useStoreCourse";
import useStoreToken from "./useStoreToken";
import { decodeToken } from "react-jwt";

function useQueryOfficeHoursFiltered() {
  const queryKey = ["officeHours"];
  const token = useStoreToken((state) => state.token);
  const { id } =
    decodeToken(token);
  const course = useStoreCourse((state) => state.course);



  const getOfficeHoursFiltered = async () => {
    try {
      let res = await axios.get(
        `${BASE_URL}/api/course/${course.id}/officeHours/`,
        getConfig(token)
      )

      return res;
    } catch (err) {
      throw err;
    }
  };

  return {
    ...useQuery(queryKey, getOfficeHoursFiltered),
  };
}

export default useQueryOfficeHoursFiltered;
