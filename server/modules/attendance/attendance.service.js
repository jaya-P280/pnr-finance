import attendanceRepository from "./attendance.repository.js";

class AttendanceService {
  async markAttendance(data, recorder) {
    const userRole = (recorder?.role_name || recorder?.role || "").toUpperCase().replace(/\s+/g, "_");
    const isAdmin = ["SUPER_ADMIN", "ADMIN", "BRANCH_MANAGER"].includes(userRole);

    const userId = (!isAdmin && recorder?.user_id) ? recorder.user_id : (data.userId || recorder?.user_id);
    const branchId = data.branchId || recorder?.branch_id;
    const attendanceDate = data.attendanceDate || new Date().toISOString().split("T")[0];
    const clockIn = data.clockIn || (data.status === "PRESENT" ? new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }) : null);

    return await attendanceRepository.markAttendance({
      userId,
      branchId,
      attendanceDate,
      clockIn,
      clockOut: data.clockOut || null,
      status: data.status || "PRESENT",
      remarks: data.remarks || "",
      recordedBy: recorder?.user_id,
    });
  }

  async getAttendance(query, user) {
    const userRole = (user?.role_name || user?.role || "").toUpperCase().replace(/\s+/g, "_");
    const isAdmin = ["SUPER_ADMIN", "ADMIN", "BRANCH_MANAGER"].includes(userRole);

    const finalQuery = { ...query };
    if (!isAdmin && user?.user_id) {
      finalQuery.userId = user.user_id;
    }
    return await attendanceRepository.getAllAttendance(finalQuery);
  }

  async getSummary(query, user) {
    const userRole = (user?.role_name || user?.role || "").toUpperCase().replace(/\s+/g, "_");
    const isAdmin = ["SUPER_ADMIN", "ADMIN", "BRANCH_MANAGER"].includes(userRole);

    const finalQuery = { ...query };
    if (!isAdmin && user?.user_id) {
      finalQuery.userId = user.user_id;
    }
    return await attendanceRepository.getSummary(finalQuery);
  }
}

export default new AttendanceService();
