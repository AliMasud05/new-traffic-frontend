import axios from "axios";

const API_BASE_URL = "https://new-traffic-backend.vercel.app"; // Replace with your backend URL

export const fetchVehicles = async () => {
  const response = await axios.get(`${API_BASE_URL}/vehicles`);
  return response.data;
};

export const fetchTopicsByVehicle = async (vehicleId) => {
  const response = await axios.get(`${API_BASE_URL}/topics?vehicleId=${vehicleId}`);
  return response.data;
};

export const updateQuestion = async (id, data) => {
  const response = await axios.put(`${API_BASE_URL}/questions/${id}`, data);
  return response.data;
};