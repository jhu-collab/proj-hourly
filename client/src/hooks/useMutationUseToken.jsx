import axios from "axios";
import { useMutation, useQueryClient } from "react-query";
import { errorToast } from "../utils/toasts";
import { getConfig } from "./helper";
import { toast } from "react-toastify";
import { BASE_URL } from "../services/common";
import useStoreToken from "./useStoreToken";
import useStoreCourse from "./useStoreCourse";
import Debug from "debug";
import NiceModal from "@ebay/nice-modal-react";

const debug = new Debug(`hourly:hooks:useMutationUseToken.jsx`);

function useMutationUseToken(studentId, courseId) {
  const token = useStoreToken((state) => state.token);
  const queryClient = useQueryClient();

  const course = useStoreCourse((state) => state.course);

  const useToken = async (tokenId) => {
    try {
      debug("Sending token to be used to the backend...");
      const endpoint = `${BASE_URL}/api/courseToken/${courseId}/usedToken/${tokenId}/student/${studentId}`;
      const res = await axios.post(
        endpoint,
        { date: (new Date()).toISOString() },
        getConfig(token)
      );
      debug("Successful! Returning result data...");
      return res.data;
    } catch (err) {
      throw err;
    }
  };

  const mutation = useMutation(useToken, {
    onSuccess: () => {
      NiceModal.hide("use-course-token");
      queryClient.invalidateQueries(["remainingTokensPerStudent"]);
      queryClient.invalidateQueries(["remainingTokens"]);
      toast.success(`Successfully used the user's token`);
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

export default useMutationUseToken;
