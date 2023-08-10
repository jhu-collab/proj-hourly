import axios from "axios";
import { useMutation, useQueryClient } from "react-query";
import { errorToast } from "../utils/toasts";
import { getConfig } from "./helper";
import NiceModal from "@ebay/nice-modal-react";
import { toast } from "react-toastify";
import { BASE_URL } from "../services/common";
import useStoreToken from "./useStoreToken";
import Debug from "debug";

const debug = new Debug(`hourly:hooks:useMutationCreateToken.jsx`);

function useMutationCreateToken() {
  const { token } = useStoreToken();
  const queryClient = useQueryClient();

  const createTopic = async (body) => {
    try {
      debug("Sending body of token to be created to the backend...");
      const endpoint = `${BASE_URL}/api/courseToken/${body.courseId}/createToken`;
      const res = await axios.post(
        endpoint,
        {
          title: body.name,
          description: body.description,
          tokenLimit: body.quantity,
        },
        getConfig(token)
      );
      debug("Successful! Returning result data...");
      return res.data;
    } catch (err) {
      throw err;
    }
  };

  const mutation = useMutation(createTopic, {
    onSuccess: (data) => {
      const token = data.courseToken;

      queryClient.invalidateQueries(["tokens"]);
      queryClient.invalidateQueries(["tokenCounts"]);
      NiceModal.hide("create-topic");
      toast.success(`Successfully created the "${token.title}" token!`);
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

export default useMutationCreateToken;
