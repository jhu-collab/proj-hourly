import axios from "axios";
import { BASE_URL } from "../services/common";

// GET REQUESTS

export const getCourses = async () => {
  const res = await axios.get(`${BASE_URL}/api/account/me/courses`, {
    // TODO: Need to remove id key once backend implements user tokens
    headers: { id: 1 },
  });
  return res.data;
};

// POST REQUESTS

export const login = async (body) => {
    const res = await axios.post(`${BASE_URL}/api/account/login`, body);
    return res.data;
  };

export const createCourse = async (body) => {
  const res = await axios.post(`${BASE_URL}/api/course/`, body, {
    headers: { id: 1 },
  });
  return res.data;
};

