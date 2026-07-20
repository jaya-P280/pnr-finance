import api from "./axois";
import ENDPOINTS from "./endpoint";

export const getHealth = () => api.get(ENDPOINTS.HEALTH);
