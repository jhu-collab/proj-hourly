import axios from "axios";
import { BASE_URL } from "../services/common";
import useStore from "../services/store";

function getUserId() {
  return useStore.getState().userId;
}

function getCourseId() {
  return useStore.getState().currentCourse.id;
}

// GET REQUESTS

// TODO: Once token authorization is set up, id will be replaced.
export const getCourses = async () => {
  const res = await axios.get(`${BASE_URL}/api/account/me/courses`, {
    // TODO: Need to remove id key once backend implements user tokens
    headers: { id: getUserId() },
  });
  return res.data;
};

export const fetchUsers = async () => {
  const res = await axios.get(
    `${BASE_URL}/api/course/${getCourseId()}/getRoster`,
    {
      headers: { id: getUserId() },
    }
  );
  return res.data;
};

export const getOfficeHours = async () => {
  const res = await axios.get(
    `${BASE_URL}/api/course/${getCourseId()}/officeHours`,
    {
      // TODO: Need to remove id key once backend implements user tokens
      headers: { id: getUserId() },
    }
  );
  return res.data;
};

// POST REQUESTS

export const login = async (body) => {
  const res = await axios.post(`${BASE_URL}/api/account/login`, body);
  return res.data;
};

export const signUp = async (body) => {
  const res = await axios.post(`${BASE_URL}/api/account/signup`, body);
  return res.data;
};

export const createCourse = async (body) => {
  const res = await axios.post(`${BASE_URL}/api/course/`, body);
  return res.data;
};

export const createOfficeHour = async (body) => {
  const res = await axios.post(`${BASE_URL}/api/officeHour/create`, body);
  return res.data;
};

export const cancelAll = async (body) => {
  const res = await axios.post(`${BASE_URL}/api/officeHour/cancelAll`, body, {
    headers: { id: getUserId() },
  });
  return res.data;
};

export const joinCourse = async (course) => {
  const res = await axios.post(`${BASE_URL}/api/course/signup/`, course, {
    headers: { id: getUserId() },
  });
  return res.data;
};
