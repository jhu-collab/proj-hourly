import axios from "axios";
import { useMutation, useQueryClient } from "react-query";
import { errorToast } from "../utils/toasts";
import { getConfig } from "./helper";
import { toast } from "react-toastify";
import { useCourseStore, useStoreToken } from "../services/store";
import { BASE_URL } from "../services/common";

function useMutationRemoveUser(removeId, isStaff) {
  const { token } = useStoreToken();
  const queryClient = useQueryClient();

  const course = useCourseStore((state) => state.course);

  const removeStaff = async () => {
    try {
      const endpoint = `${BASE_URL}/api/course/${course.id}/removeStaff/${removeId}`;
      const res = await axios.delete(endpoint, getConfig(token));
      return res.data;
    } catch (err) {
      throw err;
    }
  };

  const removeStudent = async () => {
    try {
      const endpoint = `${BASE_URL}/api/course/${course.id}/removeStudent/${removeId}`;
      const res = await axios.delete(endpoint, getConfig(token));
      return res.data;
    } catch (err) {
      throw err;
    }
  };

  const mutation = useMutation(isStaff ? removeStaff : removeStudent, {
    onSuccess: () => {
      queryClient.invalidateQueries(["users"]);
      toast.success(`Successfully removed the user`);
    },
    onError: (err) => {
      errorToast(err);
    },
  });

  return {
    ...mutation,
  };
}

export default useMutationRemoveUser;
