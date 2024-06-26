import axios from "axios";
import { decodeToken, isExpired } from "react-jwt";
import { errorToast } from "../utils/toasts";
import Debug from "debug";
import { BASE_URL } from "../services/common";
import useStoreToken from "./useStoreToken";
import { toast } from "react-toastify";

const debug = new Debug(`hourly:hooks:useAuth.jsx`);

function useAuthForgotPassword() {
  const { token } = useStoreToken();

  const isAuthenticated = () => {
    if (!token || isExpired(token)) {
      debug("Expired or no token!");
      return false;
    }
    debug("There is a valid token...");
    return true;
  };

  const forgotPassword = async ({ username }) => {
    try {
      debug("Sending username and password to the backend!");
      const endpoint = `${BASE_URL}/api/account/forgotPassword`;
      const res = await axios.post(endpoint, {
        username,
      });
      toast.success(res.data.msg);
    } catch (err) {
      debug({ err });
      errorToast(err);
    }
  };

  return {
    isAuthenticated,
    forgotPassword,
  };
}

export default useAuthForgotPassword;
