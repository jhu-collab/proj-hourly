import axios from "axios";
import { BASE_URL } from "../services/common";
import useStore, { useEventStore } from "../services/store";
import { getIsoDate } from "./helpers";

function getUserId() {
  return useStore.getState().userId;
}

function getCourseId() {
  return useStore.getState().currentCourse.id;
}

function getOfficeHourId() {
  return useEventStore.getState().description.id;
}

function getEventDate() {
  return getIsoDate(useEventStore.getState().start);
}

// GET REQUESTS

// TODO: Once token authorization is set up, id will be replaced.
export const getCourses = async () => {
  const res = await axios.get(`${BASE_URL}/api/course/`, {
    // TODO: Need to remove id key once backend implements user tokens
    headers: { id: getUserId() },
  });
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

export const getTimeSlots = async () => {
  console.log(
    `${BASE_URL}/api/officeHour/${getOfficeHourId()}/getRemainingTimeSlots/${getEventDate()}`
  );
  const res = await axios.get(
    `${BASE_URL}/api/officeHour/${getOfficeHourId()}/getRemainingTimeSlots/${getEventDate()}`,
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

export const register = async (body) => {
  const res = await axios.post(`${BASE_URL}/api/officeHour/register`, body, {
    headers: { id: getUserId() },
  });
  return res.data;
};
