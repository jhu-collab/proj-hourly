import axios from "axios";
import { decodeToken, isExpired } from "react-jwt";
import { errorToast } from "../utils/toasts";
import Debug from "debug";
import { BASE_URL } from "../services/common";
import useStoreToken from "./useStoreToken";

const debug = new Debug(`hourly:hooks:useAuth.jsx`);

function useAuthResetPassword() {
  const { token } = useStoreToken();

  const isAuthenticated = () => {
    if (!token || isExpired(token)) {
      debug("Expired or no token!");
      return false;
    }
    debug("There is a valid token...");
    return true;
  };

  const resetPassword = async ({ password, id, email }) => {
    try {
      debug("Sending username and password to the backend!");
      const endpoint = `${BASE_URL}/api/account/resetPassword`;
      const res = await axios.post(endpoint, {
        newPassword: password,
        id,
        email,
      });
    } catch (err) {
      debug({ err });
      errorToast(err);
    }
  };

  return {
    isAuthenticated,
    resetPassword,
  };
}

export default useAuthResetPassword;
