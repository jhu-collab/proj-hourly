import axios from "axios";
import { useMutation, useQueryClient } from "react-query";
import { errorToast } from "../utils/toasts";
import { getConfig } from "./helper";
import NiceModal from "@ebay/nice-modal-react";
import { toast } from "react-toastify";
import { BASE_URL } from "../services/common";
import useStoreToken from "./useStoreToken";
import Debug from "debug";

const debug = new Debug(`hourly:hooks:useMutationCreateTopic.jsx`);

function useMutationCreateTopic() {
  const { token } = useStoreToken();
  const queryClient = useQueryClient();

  const createTopic = async (body) => {
    try {
      debug("Sending body of topic to be created to the backend...");
      const endpoint = `${BASE_URL}/api/course/createTopic`;
      const res = await axios.post(endpoint, body, getConfig(token));
      debug("Successful! Returning result data...");
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
      debug( {err} );
      errorToast(err);
    },
  });

  return {
    ...mutation,
  };
}

export default useMutationCreateTopic;
