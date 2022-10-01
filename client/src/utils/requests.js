import axios from "axios";
import moment from "moment";
import { BASE_URL } from "../services/common";
import { useEventStore, useCourseStore } from "../services/store";

function getCourseId() {
  return useCourseStore.getState().course.id;
}

function getOfficeHourId() {
  return useEventStore.getState().id;
}

function getEventDate() {
  return moment(useEventStore.getState().start).format("MM-DD-YYYY");
}

// GET REQUESTS

export const getAllRegistrations = async () => {
  const res = await axios.get(
    `${BASE_URL}/api/course/${getCourseId()}/getAllRegistrations`,
    getConfig()
  );
  return res.data;
};

// POST REQUESTS

export const editEventOnDate = async (body) => {
  const res = await axios.post(
    `${BASE_URL}/api/officeHour/${getOfficeHourId()}/editForDate/${getEventDate()}`,
    body,
    getConfig()
  );
  return res.data;
};

export const editEventAll = async (body) => {
  const res = await axios.post(
    `${BASE_URL}/api/officeHour/${getOfficeHourId()}/editAll`,
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
  const res = await axios.delete(
    `${BASE_URL}/api/course/leave/${courseid}`,
    getConfig()
  );
  return res.data;
};
