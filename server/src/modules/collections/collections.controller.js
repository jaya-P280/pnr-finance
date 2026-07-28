import collectionService from "./collections.service.js";
import collectionRepository from "./collections.repository.js";
import ApiResponse from "../../shared/ApiResponse.js";
import { COLLECTION_MESSAGES } from "./collections.constants.js";

class CollectionController {
  create = async (req, res, next) => {
    try {
      const result = await collectionService.createCollection(req.body, req.user);
      res.status(201).json(new ApiResponse(201, COLLECTION_MESSAGES.CREATED, result));
    } catch (error) { next(error); }
  };

  list = async (req, res, next) => {
    try {
      const result = await collectionService.getCollections(req.query);
      res.json(new ApiResponse(200, COLLECTION_MESSAGES.FETCHED, result.collections, result.pagination));
    } catch (error) { next(error); }
  };

  getById = async (req, res, next) => {
    try {
      const result = await collectionService.getCollectionById(req.params.id);
      res.json(new ApiResponse(200, COLLECTION_MESSAGES.FETCHED_ONE, result));
    } catch (error) { next(error); }
  };

  update = async (req, res, next) => {
    try {
      await collectionService.updateCollection(req.params.id, req.body, req.user);
      res.json(new ApiResponse(200, COLLECTION_MESSAGES.UPDATED));
    } catch (error) { next(error); }
  };

  delete = async (req, res, next) => {
    try {
      await collectionService.deleteCollection(req.params.id);
      res.json(new ApiResponse(200, COLLECTION_MESSAGES.DELETED));
    } catch (error) { next(error); }
  };

  // Summary stats for dashboard
  summary = async (req, res, next) => {
    try {
      const branchId = req.query.branchId || null;
      const todayCollection = await collectionRepository.getTodayCollection(branchId);
      const monthlyCollection = await collectionRepository.getMonthlyCollection(branchId);
      const overdueTotal = await collectionRepository.getOverdueTotal(branchId);
      const chartData = await collectionRepository.getCollectionChartData(branchId);
      res.json(new ApiResponse(200, "Summary fetched.", { todayCollection, monthlyCollection, overdueTotal, chartData }));
    } catch (error) { next(error); }
  };
}

export default new CollectionController();