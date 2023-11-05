import axios from "axios";
import { useMutation, useQueryClient } from "react-query";
import { errorToast } from "../utils/toasts";
import { getConfig } from "./helper";
import { toast } from "react-toastify";
import { BASE_URL } from "../services/common";
import useStoreToken from "./useStoreToken";
import Debug from "debug";

const debug = new Debug(`hourly:hooks:useMutationDeleteTokenOverride.jsx`);

function useMutationDeleteTokenOverride(courseId, courseTokenId, studentId) {
  const { token } = useStoreToken();
  const queryClient = useQueryClient();

  const editTopic = async (body) => {
    try {
      debug("Sending token override to be deleted to the backend...");
      const endpoint = `${BASE_URL}/api/courseToken/${courseId}/deleteOverrideAmount/${courseTokenId}/student/${studentId}`;
      const res = await axios.delete(endpoint, getConfig(token));
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
      queryClient.invalidateQueries(["remainingTokensPerStudent"]);
      toast.success(`Successfully updated the token override for the student!`);
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

export default useMutationDeleteTokenOverride;
