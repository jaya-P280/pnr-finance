import api from "./axois";
import ENDPOINTS from "./endpoint";

export const getRoles = () => api.get(ENDPOINTS.ROLES);
