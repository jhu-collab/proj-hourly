import axios from "axios";
import { useStoreToken } from "../services/store";
import { decodeToken, isExpired } from "react-jwt";
import { errorToast } from "../utils/toasts";
import Debug from "debug";
import { BASE_URL } from "../services/common";

const debug = new Debug(`hourly:hooks:useAuth.js`);

function useAuth() {
  const { token, updateToken } = useStoreToken();

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

  const ssoSignIn = async () => {
    debug("Redirect to the Hourly API for JHU SSO...");
    window.location.href = import.meta.env.VITE_HOURLY_SSO_JHU_URL;
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
    updateToken("");
  };

  // This should only be used in local development!
  const signInAsAdmin = async () => {
    debug("Sign in as a sample admin user!");
    signIn({
      username: import.meta.env.VITE_ADMIN_USERNAME,
      password: import.meta.env.VITE_ADMIN_PASSPORT,
    });
  };

  // This should only be used in local development!
  const signInAsUser = async () => {
    debug("Sign in as a sample (regular) user!");
    signIn({
      username: import.meta.env.VITE_USER_USERNAME,
      password: import.meta.env.VITE_USER_PASSPORT,
    });
  };

  return {
    isAuthenticated,
    isTokenExpired,
    isAdmin,
    ssoSignIn,
    signIn,
    signOut,
    signInAsAdmin,
    signInAsUser,
  };
}

export default useAuth;
