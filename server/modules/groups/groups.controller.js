import groupService from "./groups.service.js";
import ApiResponse from "../../shared/ApiResponse.js";
import { GROUP_MESSAGES } from "./groups.constants.js";

class GroupController {
  create = async (req, res, next) => {
    try {
      const result = await groupService.createGroup(req.body, req.user);
      res.status(201).json(new ApiResponse(201, GROUP_MESSAGES.CREATED, result));
    } catch (error) { next(error); }
  };

  list = async (req, res, next) => {
    try {
      const result = await groupService.getGroups(req.query, req.user);
      res.json(new ApiResponse(200, GROUP_MESSAGES.FETCHED, result.groups, result.pagination));
    } catch (error) { next(error); }
  };

  getById = async (req, res, next) => {
    try {
      const result = await groupService.getGroupById(req.params.id);
      res.json(new ApiResponse(200, GROUP_MESSAGES.FETCHED_ONE, result));
    } catch (error) { next(error); }
  };

  update = async (req, res, next) => {
    try {
      await groupService.updateGroup(req.params.id, req.body, req.user);
      res.json(new ApiResponse(200, GROUP_MESSAGES.UPDATED));
    } catch (error) { next(error); }
  };

  delete = async (req, res, next) => {
    try {
      await groupService.deleteGroup(req.params.id, req.user);
      res.json(new ApiResponse(200, GROUP_MESSAGES.DELETED));
    } catch (error) { next(error); }
  };

  addMember = async (req, res, next) => {
    try {
      await groupService.addMember(req.params.id, req.body.customerId, req.user, req.body.role);
      res.json(new ApiResponse(200, GROUP_MESSAGES.MEMBER_ADDED));
    } catch (error) { next(error); }
  };

  removeMember = async (req, res, next) => {
    try {
      await groupService.removeMember(req.params.id, req.params.customerId, req.user);
      res.json(new ApiResponse(200, GROUP_MESSAGES.MEMBER_REMOVED));
    } catch (error) { next(error); }
  };

  recordAttendance = async (req, res, next) => {
    try {
      await groupService.recordAttendance(req.body, req.user);
      res.json(new ApiResponse(200, GROUP_MESSAGES.ATTENDANCE_RECORDED));
    } catch (error) { next(error); }
  };

  getAttendance = async (req, res, next) => {
    try {
      const result = await groupService.getAttendance(req.params.id, req.query.date);
      res.json(new ApiResponse(200, "Attendance fetched.", result));
    } catch (error) { next(error); }
  };
}

export default new GroupController();