import api from "./axios";
import ENDPOINTS from "./endpoint";

export const verifyPasswordToken = (token) =>
  api.get(`${ENDPOINTS.PASSWORD}/${token}`);

export const setupPassword = (data) => api.post(ENDPOINTS.PASSWORD, data);
