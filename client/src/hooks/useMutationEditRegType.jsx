import axios from "axios";
import { useMutation, useQueryClient } from "react-query";
import { errorToast } from "../utils/toasts";
import { getConfig } from "./helper";
import { toast } from "react-toastify";
import { BASE_URL } from "../services/common";
import useStoreToken from "./useStoreToken";
import useStoreCourse from "./useStoreCourse";

function useMutationEditRegType(registrationTypeId) {
  const { token } = useStoreToken();
  const queryClient = useQueryClient();

  const course = useStoreCourse((state) => state.course);

  const editRegistrationType = async (registrationType) => {
    try {
      const endpoint = `${BASE_URL}/api/course/${course.id}/officeHourTimeInterval/${registrationTypeId}/update`;
      const res = await axios.post(
        endpoint,
        registrationType,
        getConfig(token)
      );
      return res.data;
    } catch (err) {
      throw err;
    }
  };

  const mutation = useMutation(editRegistrationType, {
    onSuccess: (data) => {
      queryClient.invalidateQueries(["registrationTypes"]);
      toast.success(`Successfully updated the registration type!`);
    },
    onError: (err) => {
      errorToast(err);
    },
  });

  return {
    ...mutation,
  };
}

export default useMutationEditRegType;
