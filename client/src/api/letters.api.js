import api from "./axios";
import ENDPOINTS from "./endpoint";

export const createLetter = (data) => api.post(ENDPOINTS.LETTERS, data);
export const getLetters = () => api.get(ENDPOINTS.LETTERS);
