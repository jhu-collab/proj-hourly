import axios from "axios";
import { decodeToken, isExpired } from "react-jwt";
import { errorToast } from "../utils/toasts";
import Debug from "debug";
import { BASE_URL } from "../services/common";
import useStoreToken from "./useStoreToken";
import { useResetStates } from "./helper";

const debug = new Debug(`hourly:hooks:useAuth.jsx`);

function useAuth() {
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

  const isTokenExpired = () => {
    if (token && isExpired(token)) {
      debug("Token is expired...");
      return true;
    }
    debug("There is a valid token...");
    return false;
  };

  const isAdmin = () => {
    const { role } = decodeToken(token);
    if (role === "Admin") {
      debug("Token belongs to an admin...");
      return true;
    }
    debug("User is not an admin...");
    return false;
  };

  const signIn = async ({ username, password }) => {
    try {
      debug("Sending username and password to the backend!");
      const endpoint = `${BASE_URL}/authenticate`;
      const res = await axios.post(endpoint, { username, password });
      const { token } = res.data;
      debug("Going to update the token...");
      updateToken(token);
    } catch (err) {
      debug({ err });
      errorToast(err);
    }
  };

  const signOut = async () => {
    debug("Remove token...");
    resetAll();
  };

  // This should only be used in local development!
  const signInAsAdmin = async () => {
    debug("Sign in as a sample admin user!");
    signIn({
      username: import.meta.env.VITE_ADMIN_USERNAME,
      password: import.meta.env.VITE_ADMIN_PASSWORD,
    });
  };

  // This should only be used in local development!
  const signInAsUser = async () => {
    debug("Sign in as a sample (regular) user!");
    signIn({
      username: import.meta.env.VITE_USER_USERNAME,
      password: import.meta.env.VITE_USER_PASSWORD,
    });
  };

  return {
    isAuthenticated,
    isTokenExpired,
    isAdmin,
    signIn,
    signOut,
    signInAsAdmin,
    signInAsUser,
  };
}

export default useAuth;
