import axios from "axios";
import { useMutation, useQueryClient } from "react-query";
import { errorToast } from "../utils/toasts";
import { getConfig } from "./helper";
import { toast } from "react-toastify";
import { BASE_URL } from "../services/common";
import useStoreToken from "./useStoreToken";

function useMutationDeleteTopic() {
  const { token } = useStoreToken();
  const queryClient = useQueryClient();

  const deleteTopic = async (topicId) => {
    try {
      const endpoint = `${BASE_URL}/api/course/topic/${topicId}`;
      const res = await axios.delete(endpoint, getConfig(token));
      return res.data;
    } catch (err) {
      throw err;
    }
  };

  const mutation = useMutation(deleteTopic, {
    onSuccess: (data) => {
      queryClient.invalidateQueries(["topics"]);
      toast.success(`Successfully deleted the "${data.value}" topic!`);
    },
    onError: (err) => {
      errorToast(err);
    },
  });

  return {
    ...mutation,
  };
}

export default useMutationDeleteTopic;
