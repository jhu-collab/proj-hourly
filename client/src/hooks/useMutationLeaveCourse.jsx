import axios from "axios";
import { useMutation, useQueryClient } from "react-query";
import { errorToast } from "../utils/toasts";
import { getConfig } from "./helper";
import { toast } from "react-toastify";
import { BASE_URL } from "../services/common";
import { useNavigate } from "react-router-dom";
import useStoreToken from "./useStoreToken";

function useMutationLeaveCourse(courseId) {
  const { token } = useStoreToken();
  const queryClient = useQueryClient();

  const navigate = useNavigate();

  const leaveCourse = async () => {
    try {
      const endpoint = `${BASE_URL}/api/course/leave/${courseId}`;
      const res = await axios.delete(endpoint, getConfig(token));
      return res.data;
    } catch (err) {
      throw err;
    }
  };

  const mutation = useMutation(leaveCourse, {
    onSuccess: () => {
      queryClient.invalidateQueries(["courses"]);
      toast.success(`Successfully removed course!`);
      navigate("/");
    },
    onError: (error) => {
      errorToast(error);
    },
  });

  return {
    ...mutation,
  };
}

export default useMutationLeaveCourse;
