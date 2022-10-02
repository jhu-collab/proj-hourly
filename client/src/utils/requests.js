import axios from "axios";
import { BASE_URL } from "../services/common";
import { useCourseStore } from "../services/store";

function getCourseId() {
  return useCourseStore.getState().course.id;
}

// POST REQUESTS

export const removeStaffOrStudent = async (removeId, isStaff) => {
  if (isStaff) {
    const res = await axios.delete(
      `${BASE_URL}/api/course/${getCourseId()}/removeStaff/${removeId}`,
      getConfig()
    );
    return res.data;
  } else {
    const res = await axios.delete(
      `${BASE_URL}/api/course/${getCourseId()}/removeStudent/${removeId}`,
      getConfig()
    );
    return res.data;
  }
};
