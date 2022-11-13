import axios from "axios";
import { useMutation, useQueryClient } from "react-query";
import { errorToast } from "../utils/toasts";
import { getConfig } from "./helper";
import { BASE_URL } from "../services/common";
import { toast } from "react-toastify";
import useStoreToken from "./useStoreToken";
import useStoreCourse from "./useStoreCourse";

function useMutationDemoteUser(params, role) {
  const { token } = useStoreToken();
  const demoteId = params.id;
  const queryClient = useQueryClient();

  const course = useStoreCourse((state) => state.course);

  const demoteStudent = async () => {
    try {
      const data = { studentId: demoteId, role: role };
      const endpoint = `${BASE_URL}/api/course/${course.id}/demote`;
      const res = await axios.post(endpoint, data, getConfig(token));
      return res.data;
    } catch (err) {
      throw err;
    }
  };

  const mutation = useMutation(demoteStudent, {
    onSuccess: () => {
      queryClient.invalidateQueries(["users"]);
      toast.success(
        `Successfully changed ${params.row.firstName} ${params.row.lastName} to Student`
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

export default useMutationDemoteUser;
