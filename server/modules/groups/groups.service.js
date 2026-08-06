import ApiError from "../../shared/ApiError.js";
import CodeGenerator from "../../shared/codeGenerator.helper.js";
import PaginationHelper from "../../shared/pagination.helper.js";
import groupRepository from "./groups.repository.js";
import { GROUP, GROUP_MESSAGES, GROUP_STATUS } from "./groups.constants.js";

class GroupService {
  async createGroup(data, currentUser) {
    const connection = await groupRepository.beginTransaction();
    try {
      const lastGroup = await groupRepository.getLastGroupCode();
      const groupCode = CodeGenerator.generate(GROUP.PREFIX, lastGroup?.group_code, GROUP.PAD_LENGTH);

      const groupId = await groupRepository.create(connection, {
        groupCode,
        groupName: data.groupName,
        branchId: data.branchId,
        fieldOfficerId: data.fieldOfficerId || (currentUser?.role_name === "FIELD_OFFICER" ? currentUser.user_id : null),
        description: data.description,
        meetingDay: data.meetingDay,
        status: data.status || "ACTIVE",
        createdBy: currentUser.user_id,
      });

      // If members provided, add them
      if (data.memberIds && Array.isArray(data.memberIds)) {
        for (const customerId of data.memberIds) {
          await groupRepository.addMember(connection, {
            groupId,
            customerId,
            role: "MEMBER",
            addedBy: currentUser.user_id,
          });
        }
      }

      await groupRepository.commit(connection);
      return { groupId, groupCode };
    } catch (error) {
      await groupRepository.rollback(connection);
      throw error;
    }
  }

  async getGroups(query, currentUser) {
    const { page, limit } = PaginationHelper.build(query);
    let fieldOfficerId = query.fieldOfficerId || null;
    let branchId = query.branchId || null;

    if (currentUser?.role_name === "FIELD_OFFICER") {
      fieldOfficerId = currentUser.user_id;
      if (currentUser.branch_id) {
        branchId = currentUser.branch_id;
      }
    } else if (currentUser?.role_name === "BRANCH_MANAGER" && currentUser.branch_id) {
      branchId = currentUser.branch_id;
    }

    const filters = {
      page, limit,
      search: query.search?.trim() || null,
      branchId,
      fieldOfficerId,
      status: query.status || null,
    };
    const groups = await groupRepository.findAll(filters);
    const totalRecords = await groupRepository.count(filters);
    return { groups, pagination: PaginationHelper.metadata(page, limit, totalRecords) };
  }

  async getGroupById(id) {
    const group = await groupRepository.findById(id);
    if (!group) throw new ApiError(404, GROUP_MESSAGES.NOT_FOUND);
    const members = await groupRepository.getMembers(id);
    return { ...group, members };
  }

  async updateGroup(id, data, currentUser) {
    const connection = await groupRepository.beginTransaction();
    try {
      const group = await groupRepository.findById(id);
      if (!group) throw new ApiError(404, GROUP_MESSAGES.NOT_FOUND);
      await groupRepository.update(connection, id, { ...data, updatedBy: currentUser.user_id });
      await groupRepository.commit(connection);
    } catch (error) {
      await groupRepository.rollback(connection);
      throw error;
    }
  }

  async deleteGroup(id, currentUser) {
    const connection = await groupRepository.beginTransaction();
    try {
      const group = await groupRepository.findById(id);
      if (!group) throw new ApiError(404, GROUP_MESSAGES.NOT_FOUND);
      await groupRepository.delete(connection, id, currentUser.user_id);
      await groupRepository.commit(connection);
    } catch (error) {
      await groupRepository.rollback(connection);
      throw error;
    }
  }

  // --- Members ---
  async addMember(groupId, customerId, currentUser, role = "MEMBER") {
    const group = await groupRepository.findById(groupId);
    if (!group) throw new ApiError(404, GROUP_MESSAGES.NOT_FOUND);
    const already = await groupRepository.isMember(groupId, customerId);
    if (already) throw new ApiError(409, "Customer is already a member of this group.");

    const connection = await groupRepository.beginTransaction();
    try {
      await groupRepository.addMember(connection, { groupId, customerId, role: role || "MEMBER", addedBy: currentUser.user_id });
      await groupRepository.commit(connection);
    } catch (error) {
      await groupRepository.rollback(connection);
      throw error;
    }
  }

  async removeMember(groupId, customerId, currentUser) {
    const connection = await groupRepository.beginTransaction();
    try {
      await groupRepository.removeMember(connection, groupId, customerId);
      await groupRepository.commit(connection);
    } catch (error) {
      await groupRepository.rollback(connection);
      throw error;
    }
  }

  // --- Attendance ---
  async recordAttendance(data, currentUser) {
    const connection = await groupRepository.beginTransaction();
    try {
      const records = data.attendance.map((a) => ({
        groupId: data.groupId,
        customerId: a.customerId,
        meetingDate: data.meetingDate,
        status: a.status,
        remarks: a.remarks,
        recordedBy: currentUser.user_id,
      }));
      await groupRepository.recordAttendance(connection, records);
      await groupRepository.commit(connection);
    } catch (error) {
      await groupRepository.rollback(connection);
      throw error;
    }
  }

  async getAttendance(groupId, date) {
    return await groupRepository.getAttendance(groupId, date);
  }
}

export default new GroupService();