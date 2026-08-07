import axiosInstance from "../api/axios";

const salaryService = {
  getSalaries: async () => {
    const res = await axiosInstance.get("/salaries");
    return res.data;
  },
  updateStructure: async (payload) => {
    const res = await axiosInstance.post("/salaries/structure", payload);
    return res.data;
  },
  processPayout: async (payload) => {
    const res = await axiosInstance.post("/salaries/payout", payload);
    return res.data;
  },
};

export default salaryService;
