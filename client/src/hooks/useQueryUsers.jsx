import axios from "axios";
import { useQuery } from "react-query";
import { BASE_URL } from "../services/common";
import { getConfig } from "./helper";
import useStoreToken from "./useStoreToken";

function useQueryUsers() {
  const queryKey = ["users"];
  const token = useStoreToken((state) => state.token);

  const getUsers = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/account/`, getConfig(token));
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
