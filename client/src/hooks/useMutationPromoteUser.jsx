import axios from "axios";
import { useMutation, useQueryClient } from "react-query";
import { toast } from "react-toastify";
import { errorToast } from "../utils/toasts";
import { getConfig } from "./helper";
import { BASE_URL } from "../services/common";
import useStoreToken from "./useStoreToken";
import useStoreCourse from "./useStoreCourse";

function useMutationPromoteUser(params, role) {
  const { token } = useStoreToken();
  const queryClient = useQueryClient();

  const course = useStoreCourse((state) => state.course);

  const promoteStudent = async () => {
    try {
      const data = { studentId: params.id, role: role };
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
      toast.success(
        `Successfully promoted ${params.row.firstName} ${params.row.lastName}!`
      );
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
