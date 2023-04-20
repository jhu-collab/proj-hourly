import axios from "axios";
import { useMutation, useQueryClient } from "react-query";
import { errorToast } from "../utils/toasts";
import { getConfig } from "./helper";
import NiceModal from "@ebay/nice-modal-react";
import { toast } from "react-toastify";
import { BASE_URL } from "../services/common";
import useStoreToken from "./useStoreToken";
import Debug from "debug";

const debug = new Debug(`hourly:hooks:useMutationCreateCourse.jsx`);

function useMutationCreateCourse() {
  const { token } = useStoreToken();
  const queryClient = useQueryClient();

  const createCourse = async (course) => {
    try {
      debug("Sending course to be created to the backend...");
      const endpoint = `${BASE_URL}/api/course/`;
      const res = await axios.post(endpoint, course, getConfig(token));
      debug("Successful! Returning result data...");
      return res.data;
    } catch (err) {
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
    onError: (err) => {
      debug( {err} );
      errorToast(err);
    },
  });

  return {
    ...mutation,
  };
}

export default useMutationCreateCourse;
