import axios from "axios";
import { useMutation, useQueryClient } from "react-query";
import { errorToast } from "../utils/toasts";
import { getConfig } from "./helper";
import { toast } from "react-toastify";
import { BASE_URL } from "../services/common";
import useStoreToken from "./useStoreToken";
import useStoreCourse from "./useStoreCourse";
import Debug from "debug";

const debug = new Debug(`hourly:hooks:useMutationRemoveUser.jsx`);

function useMutationRemoveUser(removeId, isStaff) {
  const { token } = useStoreToken();
  const queryClient = useQueryClient();

  const course = useStoreCourse((state) => state.course);

  const removeStaff = async () => {
    try {
      debug("Sending staff to be removed to the backend...");
      const endpoint = `${BASE_URL}/api/course/${course.id}/removeStaff/${removeId}`;
      const res = await axios.delete(endpoint, getConfig(token));
      debug("Successful! Returning result data...");
      return res.data;
    } catch (err) {
      throw err;
    }
  };

  const removeStudent = async () => {
    try {
      debug("Sending student to be removed to the backend...");
      const endpoint = `${BASE_URL}/api/course/${course.id}/removeStudent/${removeId}`;
      const res = await axios.delete(endpoint, getConfig(token));
      debug("Successful! Returning result data...");
      return res.data;
    } catch (err) {
      throw err;
    }
  };

  const mutation = useMutation(isStaff ? removeStaff : removeStudent, {
    onSuccess: () => {
      queryClient.invalidateQueries(["courseUsers"]);
      toast.success(`Successfully removed the user`);
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

export default useMutationRemoveUser;
