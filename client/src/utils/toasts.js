import { toast } from "react-toastify";

/**
 * Creates an error toast.
 * @param {Error} err: an Error object
 */
export function errorToast(err) {
  if (err.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    toast.error(err.response.data.message || err.response.data.msg);
  } else if (err.request) {
    // The request was made but no response was received
    // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
    // http.ClientRequest in node.js
    toast.error(
      "Sorry, we are having some trouble connecting you to our server"
    );
  } else {
    // Something happened in setting up the request that triggered an Error
    toast.error(`An error has occurred: ${err.message || err.msg}`);
  }
}
