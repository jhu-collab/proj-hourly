import axios from 'axios';

export const fetchUsers = async () => {
  const res = await axios.get(`/api/courses/${courseId}/getRoster`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export default fetchUsers;