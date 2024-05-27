import axios from "axios";
import { decodeToken, isExpired } from "react-jwt";
import { errorToast } from "../utils/toasts";
import Debug from "debug";
import { BASE_URL } from "../services/common";
import useStoreToken from "./useStoreToken";
import { useResetStates } from "./helper";

const debug = new Debug(`hourly:hooks:useAuth.jsx`);

function useAuthSignUp() {
  const { token, updateToken } = useStoreToken();
  const { resetAll } = useResetStates();

  const isAuthenticated = () => {
    if (!token || isExpired(token)) {
      debug("Expired or no token!");
      return false;
    }
    debug("There is a valid token...");
    return true;
  };

  const signUp = async ({ username, password, email, firstName, lastName }) => {
    try {
      debug("Sending username and password to the backend!");
      const endpoint = `${BASE_URL}/api/account/signup`;
      const res = await axios.post(endpoint, {
        username,
        password,
        email,
        firstName,
        lastName,
      });
      const { token } = res.data;
      debug("Going to update the token...");
      updateToken(token);
    } catch (err) {
      debug({ err });
      errorToast(err);
    }
  };

  return {
    isAuthenticated,
    signUp,
  };
}

export default useAuthSignUp;
