import axios from "axios";
import { useQuery } from "react-query";
import { BASE_URL } from "../services/common";
import { getConfig } from "./helper";
import useStoreCourse from "./useStoreCourse";
import useStoreLayout from "./useStoreLayout";
import useStoreToken from "./useStoreToken";

function useQueryMyRole() {
  const queryKey = ["myRole"];
  const token = useStoreToken((state) => state.token);
  const course = useStoreCourse((state) => state.course);
  const courseType = useStoreLayout((state) => state.courseType);
  const toggleCourseType = useStoreLayout((state) => state.toggleCourseType);

  const getMyRole = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/api/course/${course.id}/role`,
        getConfig(token)
      );
      return res.data;
    } catch (err) {
      throw err;
    }
  };

  return {
    ...useQuery(queryKey, getMyRole, {
      onSuccess: (data) => {
        courseType !== data.role ? toggleCourseType(data.role) : "Student";
      },
    }),
  };
}

export default useQueryMyRole;
