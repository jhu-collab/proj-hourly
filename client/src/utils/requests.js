import axios from "axios";

/* GET REQUESTS */

export const getCourses = () => {
    axios
      .get(`${BASE_URL}/api/account/me/courses`, {
         // TODO: Need to remove once backend implements user tokens
        headers: { "id": 1 }, 
      })
      .then((res) => res.data)
};