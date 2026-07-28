import * as collectionApi from "../api/collection.api";

class CollectionService {
  async getAll(params) {
    const { data } = await collectionApi.getCollections(params);
    return { collections: data.data ?? [], pagination: data.meta ?? null };
  }
  async getById(id) {
    const response = await collectionApi.getCollection(id);
    return response.data.data;
  }
  async create(payload) {
    const response = await collectionApi.createCollection(payload);
    return response.data;
  }
  async update(id, payload) {
    const response = await collectionApi.updateCollection(id, payload);
    return response.data;
  }
  async delete(id) {
    const response = await collectionApi.deleteCollection(id);
    return response.data;
  }
  async getSummary(params) {
    const response = await collectionApi.getCollectionSummary(params);
    return response.data.data;
  }
}

export default new CollectionService();