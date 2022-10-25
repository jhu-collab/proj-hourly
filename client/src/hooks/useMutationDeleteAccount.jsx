import axios from "axios";
import { useMutation } from "react-query";
import { errorToast } from "../utils/toasts";
import { getConfig } from "./helper";
import { toast } from "react-toastify";
import { BASE_URL } from "../services/common";
import useStoreToken from "./useStoreToken";
import useAuth from "./useAuth";

function useMutationDeleteAccount() {
  const { signOut } = useAuth();
  const { token } = useStoreToken();

  const deleteAccount = async (userId) => {
    try {
      const endpoint = `${BASE_URL}/api/account/${userId}`;
      const res = await axios.delete(endpoint, getConfig(token));
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
      errorToast(error);
    },
  });

  return {
    ...mutation,
  };
}

export default useMutationDeleteAccount;
