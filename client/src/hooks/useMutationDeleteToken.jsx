import axios from "axios";
import { useMutation, useQueryClient } from "react-query";
import { errorToast } from "../utils/toasts";
import { getConfig } from "./helper";
import { toast } from "react-toastify";
import { BASE_URL } from "../services/common";
import useStoreToken from "./useStoreToken";
import Debug from "debug";

const debug = new Debug(`hourly:hooks:useMutationDeleteTopic.jsx`);

function useMutationDeleteToken() {
  const { token } = useStoreToken();
  const queryClient = useQueryClient();

  const deleteTopic = async (params) => {
    try {
      debug("Sending token to be deleted to the backend...");
      console.log(params);
      const endpoint = `${BASE_URL}/api/courseToken/${params.courseId}/deleteSingle/${params.courseTokenId}`;
      const res = await axios.delete(endpoint, getConfig(token));
      debug("Successful! Returning result data...");
      return res.data;
    } catch (err) {
      throw err;
    }
  };

  const mutation = useMutation(deleteTopic, {
    onSuccess: (data) => {
      queryClient.invalidateQueries(["tokens"]);
      queryClient.invalidateQueries(["tokenCounts"]);
      toast.success(`Successfully deleted the "${data.title}" token!`);
    },
    onError: (err) => {
      debug({ err });
      errorToast(err);
    },
  });

  return {
    ...mutation,
  };
}

export default useMutationDeleteToken;
