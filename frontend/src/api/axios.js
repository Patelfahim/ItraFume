import axios from "axios";
console.log(import.meta.env.VITE_API_URL);

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
  withCredentials: true, // send httpOnly JWT cookie
  headers: { "Content-Type": "application/json" },
});
// Some mobile browsers are strict about credentials preflight handling.
// Ensure axios always sends cookies for cross-origin requests.
api.defaults.withCredentials = true;

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message =
      err.response?.data?.message || "Something went wrong. Please try again.";
    return Promise.reject({ ...err, message });
  },
);

export default api;
