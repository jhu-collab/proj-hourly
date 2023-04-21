import axios from "axios";
import { useMutation, useQueryClient } from "react-query";
import { errorToast } from "../utils/toasts";
import { getConfig } from "./helper";
import { toast } from "react-toastify";
import { BASE_URL } from "../services/common";
import useStoreToken from "./useStoreToken";
import Debug from "debug";

const debug = new Debug(`hourly:hooks:useMutationDeleteTopic.jsx`);

function useMutationDeleteTopic() {
  const { token } = useStoreToken();
  const queryClient = useQueryClient();

  const deleteTopic = async (topicId) => {
    try {
      debug("Sending topic to be deleted to the backend...");
      const endpoint = `${BASE_URL}/api/course/topic/${topicId}`;
      const res = await axios.delete(endpoint, getConfig(token));
      debug("Successful! Returning result data...");
      return res.data;
    } catch (err) {
      throw err;
    }
  };

  const mutation = useMutation(deleteTopic, {
    onSuccess: (data) => {
      queryClient.invalidateQueries(["topics"]);
      queryClient.invalidateQueries(["topicCounts"]);
      toast.success(`Successfully deleted the "${data.value}" topic!`);
    },
    onError: (err) => {
      debug( {err} );
      errorToast(err);
    },
  });

  return {
    ...mutation,
  };
}

export default useMutationDeleteTopic;
