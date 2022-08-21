import axios from "axios";
import moment from "moment";
import { BASE_URL } from "../services/common";
import {
  useEventStore,
  useAccountStore,
  useCourseStore,
} from "../services/store";

function getUserId() {
  return useAccountStore.getState().id;
}

function getCourseId() {
  return useCourseStore.getState().course.id;
}

function getOfficeHourId() {
  return useEventStore.getState().id;
}

function getEventDate() {
  return moment(useEventStore.getState().start).format("MM-DD-YYYY");
}

function getConfig() {
  return {
    // TODO: Need to remove id key once backend implements user tokens
    headers: { id: getUserId() },
  };
}

// GET REQUESTS

// TODO: Once token authorization is set up, id will be replaced.
export const getCourses = async () => {
  const res = await axios.get(`${BASE_URL}/api/course/`, getConfig());
  return res.data;
};

export const fetchUsers = async () => {
  const res = await axios.get(
    `${BASE_URL}/api/course/${getCourseId()}/getRoster`,
    getConfig()
  );
  return res.data;
};

export const getOfficeHours = async () => {
  const res = await axios.get(
    `${BASE_URL}/api/course/${getCourseId()}/officeHours`,
    getConfig()
  );
  return res.data;
};

export const getTimeSlots = async () => {
  const res = await axios.get(
    `${BASE_URL}/api/officeHour/${getOfficeHourId()}/getRemainingTimeSlots/${getEventDate()}`,
    getConfig()
  );
  return res.data;
};

export const getAllRegistrations = async () => {
  const res = await axios.get(
    `${BASE_URL}/api/course/${getCourseId()}/getAllRegistrations`,
    getConfig()
  );
  return res.data;
};

// POST REQUESTS

export const login = async (body) => {
  const res = await axios.post(
    `${BASE_URL}/api/account/login`,
    body,
    getConfig()
  );
  return res.data;
};

export const signUp = async (body) => {
  const res = await axios.post(
    `${BASE_URL}/api/account/signup`,
    body,
    getConfig()
  );
  return res.data;
};

export const createCourse = async (body) => {
  const res = await axios.post(`${BASE_URL}/api/course/`, body, getConfig());
  return res.data;
};

export const createOfficeHour = async (body) => {
  const res = await axios.post(
    `${BASE_URL}/api/officeHour/create`,
    body,
    getConfig()
  );
  return res.data;
};

export const cancelOnDate = async (body) => {
  const res = await axios.post(
    `${BASE_URL}/api/officeHour/cancelOnDate`,
    body,
    getConfig()
  );
  return res.data;
};

export const cancelAll = async (body) => {
  const res = await axios.post(
    `${BASE_URL}/api/officeHour/cancelAll`,
    body,
    getConfig()
  );
  return res.data;
};

export const joinCourse = async (course) => {
  const res = await axios.post(
    `${BASE_URL}/api/course/signup/`,
    course,
    getConfig()
  );
  return res.data;
};

export const register = async (body) => {
  const res = await axios.post(
    `${BASE_URL}/api/officeHour/register`,
    body,
    getConfig()
  );
  return res.data;
};

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

export const leaveCourse = async (courseid) => {
  const res = await axios.delete(`${BASE_URL}/api/course/leave/${courseid}`, {
    headers: { id: getUserId() },
  });
  return res.data;
};
