import axios from "axios";
import { useMutation, useQueryClient } from "react-query";
import { errorToast } from "../utils/toasts";
import { getConfig } from "./helper";
import NiceModal from "@ebay/nice-modal-react";
import { toast } from "react-toastify";
import { BASE_URL } from "../services/common";
import useStoreToken from "./useStoreToken";
import useStoreCourse from "./useStoreCourse";

function useMutationCreateRegType() {
  const { token } = useStoreToken();
  const queryClient = useQueryClient();

  const course = useStoreCourse((state) => state.course);

  const createRegistrationType = async (registrationType) => {
    try {
      const endpoint = `${BASE_URL}/api/course/${course.id}/officeHourTimeInterval`;
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

  const mutation = useMutation(createRegistrationType, {
    onSuccess: (data) => {
      const registrationType = data.time;

      queryClient.invalidateQueries(["registrationTypes"]);
      NiceModal.hide("create-registration-type");

      toast.success(
        `Successfully created ${registrationType.title} registration type!`
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

export default useMutationCreateRegType;
