import axios from "axios";

/* GET REQUESTS */

export const getCourses = () => {
    axios
      .get(`${BASE_URL}/api/account/me/courses`, {
        headers: { "id": 1 },
      })
      .then((res) => res.data)
};