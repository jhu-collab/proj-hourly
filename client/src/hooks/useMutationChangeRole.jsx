import axios from "axios";
import { useMutation, useQueryClient } from "react-query";
import { toast } from "react-toastify";
import { errorToast } from "../utils/toasts";
import { getConfig } from "./helper";
import { BASE_URL } from "../services/common";
import useStoreToken from "./useStoreToken";
import useStoreCourse from "./useStoreCourse";
import NiceModal from "@ebay/nice-modal-react";
import Debug from "debug";

const debug = new Debug(`hourly:hooks:useMutationChangeRole.jsx`);

function useMutationChangeRole(params, role) {
  const { token } = useStoreToken();
  const queryClient = useQueryClient();

  const course = useStoreCourse((state) => state.course);

  const promoteStudent = async () => {
    try {
      debug("Sending student ID and role to backend to be promoted...");
      const data = { studentId: params.id, role: role };
      const endpoint = `${BASE_URL}/api/course/${course.id}`;
      const res = await axios.post(endpoint, data, getConfig(token));
      debug("Successful! Returning result data...");
      return res.data;
    } catch (err) {
      throw err;
    }
  };

  const demoteStudent = async () => {
    try {
      debug("Sending student ID and role to backend to be demoted...");
      const data = { studentId: params.id, role: role };
      const endpoint = `${BASE_URL}/api/course/${course.id}/demote`;
      const res = await axios.post(endpoint, data, getConfig(token));
      debug("Successful! Returning result data...");
      return res.data;
    } catch (err) {
      throw err;
    }
  };

  const mutation = useMutation(
    role === "Student" ? demoteStudent : promoteStudent,
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["courseUsers", course.id]);
        toast.success(
          `Successfully changed role of ${params.row.firstName} ${params.row.lastName} to ${role}!`
        );
        NiceModal.hide("change-user-role");
      },
      onError: (err) => {
        debug( {err} );
        errorToast(err);
      },
    }
  );

  return {
    ...mutation,
  };
}

export default useMutationChangeRole;
