import { toast } from "react-toastify";
import { getMessage } from "../hooks/helper";

/**
 * Creates an error toast.
 * @param {Error} err: an Error object
 */
export function errorToast(err) {
  toast.error(getMessage(err));
}
