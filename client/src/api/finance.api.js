import axiosInstance from "./axios";
import ENDPOINTS from "./endpoint";

export const getCashBookApi = (params) => axiosInstance.get(ENDPOINTS.FINANCE.CASHBOOK, { params });

export const getExpensesApi = (params) => axiosInstance.get(ENDPOINTS.FINANCE.EXPENSES, { params });
export const createExpenseApi = (data) => axiosInstance.post(ENDPOINTS.FINANCE.EXPENSES, data);
export const deleteExpenseApi = (id) => axiosInstance.delete(`${ENDPOINTS.FINANCE.EXPENSES}/${id}`);

export const getIncomeApi = (params) => axiosInstance.get(ENDPOINTS.FINANCE.INCOME, { params });
export const createIncomeApi = (data) => axiosInstance.post(ENDPOINTS.FINANCE.INCOME, data);
export const deleteIncomeApi = (id) => axiosInstance.delete(`${ENDPOINTS.FINANCE.INCOME}/${id}`);
