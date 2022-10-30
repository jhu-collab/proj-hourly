import axios from "axios";
import { useQuery } from "react-query";
import { BASE_URL } from "../services/common";
import { getConfig } from "./helper";
import useStoreCourse from "./useStoreCourse";
import useStoreToken from "./useStoreToken";

function useQueryMyRole() {
  const queryKey = ["myRole"];
  const token = useStoreToken((state) => state.token);
  const course = useStoreCourse((state) => state.course);

  const getMyRole = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/course/${course.id}/role`, getConfig(token));
      return res.data;
    } catch (err) {
      throw err;
    }
  };

  return {
    ...useQuery(queryKey, getMyRole),
  };
}

export default useQueryMyRole;