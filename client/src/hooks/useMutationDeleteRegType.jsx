import axios from "axios";
import { useMutation, useQueryClient } from "react-query";
import { errorToast } from "../utils/toasts";
import { getConfig } from "./helper";
import { toast } from "react-toastify";
import { BASE_URL } from "../services/common";
import useStoreToken from "./useStoreToken";
import useStoreCourse from "./useStoreCourse";
import Debug from "debug";

const debug = new Debug(`hourly:hooks:useMutationDeleteRegType.jsx`);

function useMutationDeleteRegType() {
  const { token } = useStoreToken();
  const queryClient = useQueryClient();

  const course = useStoreCourse((state) => state.course);

  const deleteRegType = async (registrationId) => {
    try {
      debug("Sending registration type to be deleted to the backend...");
      const endpoint = `${BASE_URL}/api/course/${course.id}/officeHourTimeInterval/${registrationId}`;
      const res = await axios.delete(endpoint, getConfig(token));
      debug("Successful! Returning result data...");
      return res.data;
    } catch (err) {
      throw err;
    }
  };

  const mutation = useMutation(deleteRegType, {
    onSuccess: (data) => {
      const registrationType = data.deletedTime;
      queryClient.invalidateQueries(["registrationTypes"]);
      toast.success(
        `Successfully deleted the "${registrationType.title}" registration type!`
      );
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

export default useMutationDeleteRegType;
