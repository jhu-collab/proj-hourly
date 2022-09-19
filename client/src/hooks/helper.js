export const BASE_URL =
  import.meta.env.VITE_RUN_MODE === "local"
    ? import.meta.env.VITE_LOC_BASE_URL
    : import.meta.env.VITE_PROD_BASE_URL;

export const getMessage = (error) => {
  const genericMessage = "Something went wrong!";
  const axiosErrorMessage = error && error.message;
  const apiErrorMessage =
    error &&
    error.response &&
    error.response.data &&
    error.response.data.message;
  const message = apiErrorMessage || axiosErrorMessage || genericMessage;
  return message;
};
