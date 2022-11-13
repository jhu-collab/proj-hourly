import axios from "axios";
import { useMutation, useQueryClient } from "react-query";
import { errorToast } from "../utils/toasts";
import { getConfig } from "./helper";
import { toast } from "react-toastify";
import { BASE_URL } from "../services/common";
import useStoreToken from "./useStoreToken";
import useStoreCourse from "./useStoreCourse";

function useMutationPromoteUser(promoteId, role) {
  const { token } = useStoreToken();
  const queryClient = useQueryClient();

  const course = useStoreCourse((state) => state.course);

  const promoteStudent = async () => {
    try {
      const data = { studentId: promoteId, role: role };
      const endpoint = `${BASE_URL}/api/course/${course.id}`;
      const res = await axios.post(endpoint, data, getConfig(token));
      return res.data;
    } catch (err) {
      throw err;
    }
  };

  const mutation = useMutation(promoteStudent, {
    onSuccess: () => {
      queryClient.invalidateQueries(["users"]);
    },
    onError: (err) => {
      errorToast(err);
    },
  });

  return {
    ...mutation,
  };
}

export default useMutationPromoteUser;
