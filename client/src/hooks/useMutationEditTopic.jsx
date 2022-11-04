import axios from "axios";
import { useMutation, useQueryClient } from "react-query";
import { errorToast } from "../utils/toasts";
import { getConfig } from "./helper";
import { toast } from "react-toastify";
import { BASE_URL } from "../services/common";
import useStoreToken from "./useStoreToken";

function useMutationEditTopic() {
  const { token } = useStoreToken();
  const queryClient = useQueryClient();

  const editTopic = async (body) => {
    try {
      const endpoint = `${BASE_URL}/api/course/editTopic`;
      const res = await axios.post(endpoint, body, getConfig(token));
      return res.data;
    } catch (err) {
      throw err;
    }
  };

  const mutation = useMutation(editTopic, {
    onSuccess: (data) => {
      queryClient.invalidateQueries(["topics"]);
      toast.success(`Successfully updated the topic!`);
    },
    onError: (err) => {
      errorToast(err);
    },
  });

  return {
    ...mutation,
  };
}

export default useMutationEditTopic;
