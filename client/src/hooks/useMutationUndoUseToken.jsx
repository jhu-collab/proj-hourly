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

const debug = new Debug(`hourly:hooks:useMutationUndoUseToken.jsx`);

function useMutationUndoUseToken(studentId, courseId) {
  const token = useStoreToken((state) => state.token);
  const queryClient = useQueryClient();

  const course = useStoreCourse((state) => state.course);

  const undoUseToken = async (obj) => {
    try {
      debug("Sending token to be undone to the backend...");
      const endpoint = `${BASE_URL}/api/courseToken/${courseId}/undoUsedToken/${obj.token}/student/${studentId}`;
      const res = await axios.post(
        endpoint,
        { date: new Date(obj.date).toISOString() },
        getConfig(token)
      );
      debug("Successful! Returning result data...");
      return res.data;
    } catch (err) {
      throw err;
    }
  };

  const mutation = useMutation(undoUseToken, {
    onSuccess: () => {
      NiceModal.hide("use-course-token");
      queryClient.invalidateQueries(["remainingTokensPerStudent"]);
      queryClient.invalidateQueries(["remainingTokens"]);
      toast.success(`Successfully unused the user's token`);
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

export default useMutationUndoUseToken;
