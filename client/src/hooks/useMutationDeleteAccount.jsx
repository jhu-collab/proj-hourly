import axios from "axios";
import { useMutation } from "react-query";
import { errorToast } from "../utils/toasts";
import { getConfig } from "./helper";
import { toast } from "react-toastify";
import { BASE_URL } from "../services/common";
import useStoreToken from "./useStoreToken";
import useAuth from "./useAuth";
import Debug from "debug";

const debug = new Debug(`hourly:hooks:useMutationDeleteAccount.jsx`);

function useMutationDeleteAccount() {
  const { signOut } = useAuth();
  const { token } = useStoreToken();

  const deleteAccount = async (userId) => {
    try {
      debug("Attempting to delete account...");
      const endpoint = `${BASE_URL}/api/account/${userId}`;
      const res = await axios.delete(endpoint, getConfig(token));
      debug("Successful! Returning result data...");
      return res.data;
    } catch (err) {
      throw err;
    }
  };

  const mutation = useMutation(deleteAccount, {
    onSuccess: () => {
      toast.success(`Successfully deleted account!`);
      signOut();
    },
    onError: (error) => {
      debug( {error} );
      errorToast(error);
    },
  });

  return {
    ...mutation,
  };
}

export default useMutationDeleteAccount;
