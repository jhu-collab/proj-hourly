import axios from "axios";
import { useQuery } from "react-query";
import { BASE_URL } from "../services/common";
import { errorToast } from "../utils/toasts";
import { getConfig } from "./helper";
import useStoreCourse from "./useStoreCourse";
import useStoreToken from "./useStoreToken";
import Debug from "debug";

const debug = new Debug(`hourly:hooks:useQueryRemainingTokens.js`);

function useQueryRemainingTokens() {
  const queryKey = ["remainingTokens"];
  const token = useStoreToken((state) => state.token);
  const course = useStoreCourse((state) => state.course);

  const getTokens = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/api/courseToken/${course.id}/tokensRemaining`,
        getConfig(token)
      );
      debug("Getting all tokens.");
      return res.data.issueTokens;
    } catch (err) {
      errorToast(err);
      throw err;
    }
  };

  return {
    ...useQuery(queryKey, getTokens),
  };
}

export default useQueryRemainingTokens;
