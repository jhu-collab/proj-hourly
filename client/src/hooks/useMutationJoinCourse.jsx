import axios from "axios";
import { useMutation, useQueryClient } from "react-query";
import { errorToast } from "../utils/toasts";
import { getConfig } from "./helper";
import NiceModal from "@ebay/nice-modal-react";
import { toast } from "react-toastify";
import { BASE_URL } from "../services/common";
import useStoreToken from "./useStoreToken";

function useMutationJoinCourse() {
  const { token } = useStoreToken();
  const queryClient = useQueryClient();

  const joinCourse = async (course) => {
    try {
      const endpoint = `${BASE_URL}/api/course/signup/`;
      const res = await axios.post(endpoint, course, getConfig(token));
      return res.data;
    } catch (err) {
      throw err;
    }
  };

  const mutation = useMutation(joinCourse, {
    onSuccess: (data) => {
      const course = data.course;
      queryClient.invalidateQueries(["courses"]);
      NiceModal.hide("join-course");
      toast.success(
        `Successfully joined ${course.title} course for ${course.semester} ${course.calendarYear}`
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

export default useMutationJoinCourse;
