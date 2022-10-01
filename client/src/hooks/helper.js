import { useStoreToken } from "../services/store";

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

export const getConfig = () => {
  const token = useStoreToken.getState().token;
  return {
    headers: { Authorization: `Bearer ${token}` },
  };
};
