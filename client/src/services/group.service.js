import * as groupApi from "../api/group.api";

class GroupService {
  async getAll(params) {
    const { data } = await groupApi.getGroups(params);
    return { groups: data.data ?? [], pagination: data.meta ?? null };
  }
  async getById(id) {
    const response = await groupApi.getGroup(id);
    return response.data.data;
  }
  async create(payload) {
    const response = await groupApi.createGroup(payload);
    return response.data;
  }
  async update(id, payload) {
    const response = await groupApi.updateGroup(id, payload);
    return response.data;
  }
  async delete(id) {
    const response = await groupApi.deleteGroup(id);
    return response.data;
  }
  async addMember(groupId, customerId, role = "MEMBER") {
    const response = await groupApi.addGroupMember(groupId, { customerId, role });
    return response.data;
  }
  async removeMember(groupId, customerId) {
    const response = await groupApi.removeGroupMember(groupId, customerId);
    return response.data;
  }
  async getAttendance(groupId, date) {
    const response = await groupApi.getGroupAttendance(groupId, { date });
    return response.data.data;
  }
  async recordAttendance(groupId, payload) {
    const response = await groupApi.recordAttendance(groupId, payload);
    return response.data;
  }
}

export default new GroupService();