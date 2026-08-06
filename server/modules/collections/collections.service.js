import ApiError from "../../shared/ApiError.js";
import CodeGenerator from "../../shared/codeGenerator.helper.js";
import PaginationHelper from "../../shared/pagination.helper.js";
import collectionRepository from "./collections.repository.js";
import { COLLECTION, COLLECTION_MESSAGES } from "./collections.constants.js";

class CollectionService {
  async createCollection(data, currentUser) {
    const connection = await collectionRepository.beginTransaction();
    try {
      const lastReceipt = await collectionRepository.getLastReceiptNo();
      const receiptNumber = CodeGenerator.generate(COLLECTION.PREFIX, lastReceipt?.receipt_number, COLLECTION.PAD_LENGTH);

      const totalAmount = Number(data.collectionAmount) + Number(data.penaltyAmount || 0);

      const collectionId = await collectionRepository.create(connection, {
        receiptNumber,
        loanId: data.loanId,
        customerId: data.customerId,
        branchId: data.branchId,
        collectedBy: data.collectedBy || currentUser.user_id,
        collectionDate: data.collectionDate,
        emiAmount: data.emiAmount || 0,
        collectionAmount: data.collectionAmount,
        penaltyAmount: data.penaltyAmount || 0,
        totalAmount,
        paymentMethod: data.paymentMethod || "CASH",
        referenceNumber: data.referenceNumber,
        remarks: data.remarks,
        status: "COMPLETED",
        createdBy: currentUser.user_id,
      });

      // Update loan outstanding amount
      await connection.execute(
        `UPDATE loans SET outstanding_amount = GREATEST(outstanding_amount - ?, 0) WHERE loan_id = ?`,
        [Number(data.collectionAmount), data.loanId],
      );

      // Record in loan_transactions
      await connection.execute(
        `INSERT INTO loan_transactions (loan_id, transaction_type, amount, transaction_date, reference_type, reference_id, remarks, created_by)
         VALUES (?, 'PAYMENT', ?, ?, 'COLLECTION', ?, ?, ?)`,
        [data.loanId, totalAmount, data.collectionDate, collectionId, data.remarks || 'Collection payment', currentUser.user_id],
      );

      await collectionRepository.commit(connection);
      return { collectionId, receiptNumber };
    } catch (error) {
      await collectionRepository.rollback(connection);
      throw error;
    }
  }

  async getCollections(query) {
    const { page, limit } = PaginationHelper.build(query);
    const filters = {
      page, limit,
      search: query.search?.trim() || null,
      loanId: query.loanId || null,
      branchId: query.branchId || null,
      status: query.status || null,
      fromDate: query.fromDate || null,
      toDate: query.toDate || null,
    };
    const collections = await collectionRepository.findAll(filters);
    const totalRecords = await collectionRepository.count(filters);
    return { collections, pagination: PaginationHelper.metadata(page, limit, totalRecords) };
  }

  async getCollectionById(id) {
    const collection = await collectionRepository.findById(id);
    if (!collection) throw new ApiError(404, COLLECTION_MESSAGES.NOT_FOUND);
    return collection;
  }

  async updateCollection(id, data, currentUser) {
    const connection = await collectionRepository.beginTransaction();
    try {
      const collection = await collectionRepository.findById(id);
      if (!collection) throw new ApiError(404, COLLECTION_MESSAGES.NOT_FOUND);
      await collectionRepository.update(connection, id, { ...data, updatedBy: currentUser.user_id, totalAmount: Number(data.collectionAmount) + Number(data.penaltyAmount || 0) });
      await collectionRepository.commit(connection);
    } catch (error) {
      await collectionRepository.rollback(connection);
      throw error;
    }
  }

  async deleteCollection(id) {
    const connection = await collectionRepository.beginTransaction();
    try {
      await collectionRepository.delete(connection, id);
      await collectionRepository.commit(connection);
    } catch (error) {
      await collectionRepository.rollback(connection);
      throw error;
    }
  }
}

export default new CollectionService();