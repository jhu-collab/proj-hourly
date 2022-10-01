import axios from "axios";
import { useQuery } from "react-query";
import { BASE_URL } from "../services/common";

function useQueryCourses() {
  const queryKey = ["courses"];

  useQuery(["courses"], getCourses);

  const getCourses = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/course/`, getConfig());
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