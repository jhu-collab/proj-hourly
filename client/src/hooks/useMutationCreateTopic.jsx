import axios from "axios";
import { useMutation, useQueryClient } from "react-query";
import { errorToast } from "../utils/toasts";
import { getConfig } from "./helper";
import NiceModal from "@ebay/nice-modal-react";
import { toast } from "react-toastify";
import { BASE_URL } from "../services/common";
import useStoreToken from "./useStoreToken";

function useMutationCreateTopic() {
  const { token } = useStoreToken();
  const queryClient = useQueryClient();

  const createTopic = async (body) => {
    try {
      const endpoint = `${BASE_URL}/api/course/createTopic`;
      const res = await axios.post(endpoint, body, getConfig(token));
      return res.data;
    } catch (err) {
      throw err;
    }
  };

  const mutation = useMutation(createTopic, {
    onSuccess: (data) => {
      const topic = data.topic;

      queryClient.invalidateQueries(["topics"]);
      queryClient.invalidateQueries(["topicCounts"]);
      NiceModal.hide("create-topic");
      toast.success(`Successfully created the "${topic.value}" topic!`);
    },
    onError: (err) => {
      errorToast(err);
    },
  });

  return {
    ...mutation,
  };
}

export default useMutationCreateTopic;
