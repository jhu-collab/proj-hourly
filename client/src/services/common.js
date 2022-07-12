export const BASE_URL =
  import.meta.env.VITE_RUN_MODE === "local"
    ? import.meta.env.VITE_LOC_BASE_URL
    : import.meta.env.VITE_RUN_MODE === "dev"
    ? import.meta.env.VITE_DEV_BASE_URL
    : import.meta.env.VITE_PROD_BASE_URL;
