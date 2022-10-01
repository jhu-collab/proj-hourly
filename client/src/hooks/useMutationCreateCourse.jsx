import axios from "axios";
import { useMutation, useQueryClient } from "react-query";
import { errorToast } from "../utils/toasts";
import { getConfig } from "./helper";
import NiceModal from "@ebay/nice-modal-react";
import { toast } from "react-toastify";
import { useStoreToken } from "../services/store";
import { BASE_URL } from "../services/common";

function useMutationCreateCourse() {
  const { token } = useStoreToken();
  const queryClient = useQueryClient();

  const createCourse = async (course) => {
    try {
      const endpoint = `${BASE_URL}/api/course/`;
      const res = await axios.post(endpoint, course, getConfig(token));
      return res.data;
    } catch (err) {
      errorToast(err);
      throw err;
    }
  };

  const mutation = useMutation(createCourse, {
    onSuccess: (data) => {
      const course = data.course;

      queryClient.invalidateQueries(["courses"]);
      NiceModal.hide("create-course");
      toast.success(
        `Successfully created the ${course.title} course for ${course.semester} ${course.calendarYear}`
      );
    },
  });

  return {
    createCourseMutation: mutation,
  };
}

export default useMutationCreateCourse;

