import axios from "axios";
import { errorToast } from "../utils/toasts";
import Debug from "debug";
import { BASE_URL } from "../services/common";
import useStoreToken from "./useStoreToken";
import { getConfig } from "./helper";
import { toast } from "react-toastify";

const debug = new Debug(`hourly:hooks:useAuth.jsx`);

function useAuthChangePassword() {
  const { token, updateToken } = useStoreToken();

  const changePassword = async ({ newPassword, oldPassword }) => {
    try {
      debug("Sending old password and new password to the backend!");
      console.log(newPassword, oldPassword);
      const endpoint = `${BASE_URL}/api/account/changePassword`;
      console.log(endpoint);
      const res = await axios.post(
        endpoint,
        {
          newPassword,
          oldPassword,
        },
        getConfig(token)
      );
      const { token: newToken } = res.data;
      debug("Going to update the token...");
      updateToken(newToken);
      toast.success("Password Changed!");
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
