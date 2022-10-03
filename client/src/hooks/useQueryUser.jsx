import axios from "axios";
import { useQuery } from "react-query";;
import useStoreToken from "./useStoreToken";
import { decodeToken } from "react-jwt";
import { errorToast } from "../utils/toasts";
import { BASE_URL } from "../services/common";
import { getConfig } from "./helper";

function useQueryUser() {
  const queryKey = ["user"];
  const { token, updateToken } = useStoreToken();

  const getUser = async () => {
    try {
      const { id } = decodeToken(token);
      const endpoint = `${BASE_URL}/api/users/${id}`;
      const res = await axios.get(endpoint, getConfig(token));
      const { data, token: newToken } = res.data;
      updateToken(newToken);
      return data;
    } catch (err) {
      errorToast(err);
      throw err;
    }
  };

  return {
    ...useQuery(queryKey, getUser),
  };
}

export default useQueryUser;