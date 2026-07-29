import api from "./axios";
import ENDPOINTS from "./endpoint";

export const getHealth = () => api.get(ENDPOINTS.HEALTH);
