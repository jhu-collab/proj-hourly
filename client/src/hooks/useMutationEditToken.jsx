import axios from "axios";
import { useMutation, useQueryClient } from "react-query";
import { errorToast } from "../utils/toasts";
import { getConfig } from "./helper";
import { toast } from "react-toastify";
import { BASE_URL } from "../services/common";
import useStoreToken from "./useStoreToken";
import Debug from "debug";

const debug = new Debug(`hourly:hooks:useMutationEditToken.jsx`);

function useMutationEditToken() {
  const { token } = useStoreToken();
  const queryClient = useQueryClient();

  const editTopic = async (body) => {
    try {
      debug("Sending topic to be edited to the backend...");
      const endpoint = `${BASE_URL}/api/courseToken/${body.courseId}/editCourseToken/${body.courseTokenId}`;
      const res = await axios.post(endpoint, body, getConfig(token));
      debug("Successful! Returning result data...");
      return res.data;
    } catch (err) {
      throw err;
    }
  };

  const mutation = useMutation(editTopic, {
    onSuccess: (data) => {
      queryClient.invalidateQueries(["tokens"]);
      queryClient.invalidateQueries(["tokenCounts"]);
      toast.success(`Successfully updated the token!`);
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

export default useMutationEditToken;
