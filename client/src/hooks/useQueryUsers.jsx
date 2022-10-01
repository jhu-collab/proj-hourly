import axios from "axios";
import { useQuery } from "react-query";
import { BASE_URL } from "../services/common";
import { useCourseStore, useStoreToken } from "../services/store";
import { getConfig } from "./helper";

function useQueryUsers() {
  const queryKey = ["users"];
  const token = useStoreToken((state) => state.token);
  const course = useCourseStore((state) => state.course);

  const getUsers = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/course/${course.id}/getRoster`, getConfig(token));
      return res.data;
    } catch (err) {
      throw err;
    }
  };

  return {
    ...useQuery(queryKey, getUsers),
  };
}

export default useQueryUsers;