import axios from "axios";
import { useQuery } from "react-query";
import { BASE_URL } from "../services/common";
import { getConfig } from "./helper";
import useStoreToken from "./useStoreToken";

function useQueryCourses() {
  const queryKey = ["courses"];
  const token = useStoreToken((state) => state.token);

  const getCourses = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/course/`, getConfig(token));
      return res.data;
    } catch (err) {
      throw err;
    }
  };

  return {
    ...useQuery(queryKey, getCourses),
  };
}

export default useQueryCourses;
