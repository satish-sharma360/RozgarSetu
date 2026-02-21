import axios from "axios";

const instance = axios.create({
  baseURL: (import.meta as any).env.VITE_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

export default instance;