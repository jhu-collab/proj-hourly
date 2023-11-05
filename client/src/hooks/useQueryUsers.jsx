import axios from "axios";
import { useQuery } from "react-query";
import { BASE_URL } from "../services/common";
import { getConfig } from "./helper";
import useStoreToken from "./useStoreToken";
import Debug from "debug";

const debug = new Debug(`hourly:hooks:useQueryUsers.js`);

function useQueryUsers() {
  const queryKey = ["users"];
  const token = useStoreToken((state) => state.token);

  const getUsers = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/account/`, getConfig(token));
      debug("Getting all user info as Admin.")
      return res.data;
    } catch (err) {
      debug({ err });
      throw err;
    }
  };

  return {
    ...useQuery(queryKey, getUsers),
  };
}

export default useQueryUsers;
