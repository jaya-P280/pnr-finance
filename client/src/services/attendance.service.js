import * as attendanceApi from "../api/attendance.api";

class AttendanceService {
  async markAttendance(payload) {
    const { data } = await attendanceApi.markAttendance(payload);
    return data;
  }

  async getAttendance(params) {
    const { data } = await attendanceApi.getAttendance(params);
    const list = data?.data ?? data ?? [];
    return Array.isArray(list) ? list : [];
  }

  async getSummary(params) {
    const { data } = await attendanceApi.getAttendanceSummary(params);
    return data?.data ?? data ?? null;
  }
}

export default new AttendanceService();
