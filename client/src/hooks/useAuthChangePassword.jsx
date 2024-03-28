import axios from "axios";
import { decodeToken, isExpired } from "react-jwt";
import { errorToast } from "../utils/toasts";
import Debug from "debug";
import { BASE_URL } from "../services/common";
import useStoreToken from "./useStoreToken";
import { getConfig } from "./helper";

const debug = new Debug(`hourly:hooks:useAuth.jsx`);

function useAuthChangePassword() {
  const { token, updateToken } = useStoreToken();

  const changePassword = async ({ newPassword, oldPassword }) => {
    try {
      debug("Sending username and password to the backend!");
      console.log(newPassword, oldPassword);
      // const endpoint = `${BASE_URL}/api/account/changePassword`;
      // const res = await axios.post(
      //   endpoint,
      //   {
      //     newPassword,
      //     oldPassword,
      //   },
      //   getConfig(token)
      // );
      // const { token } = res.data;
      // debug("Going to update the token...");
      // updateToken(token);
    } catch (err) {
      debug({ err });
      errorToast(err);
    }
  };

  return {
    changePassword,
  };
}

export default useAuthChangePassword;
