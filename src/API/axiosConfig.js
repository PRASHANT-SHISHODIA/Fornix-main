import axios from "axios";

const API = axios.create({
  baseURL: "", // change with your backend URL
  timeout: 5000,
  headers: {
    "Content-Type": "application/json",
  },
});

export default API;