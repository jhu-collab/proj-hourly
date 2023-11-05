import axios from "axios";
import { useQuery } from "react-query";
import { BASE_URL } from "../services/common";
import { getConfig } from "./helper";
import useStoreToken from "./useStoreToken";
import Debug from "debug";

const debug = new Debug(`hourly:hooks:useQueryCourses.js`);

function useQueryCourses() {
  const queryKey = ["courses"];
  const token = useStoreToken((state) => state.token);

  const getCourses = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/course/`, getConfig(token));
      debug("Get courses from backend...");
      return res.data;
    } catch (err) {
      debug({ err });
      throw err;
    }
  };

  return {
    ...useQuery(queryKey, getCourses),
  };
}

export default useQueryCourses;
