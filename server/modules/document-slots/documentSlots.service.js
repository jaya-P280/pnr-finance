import ApiError from "../../shared/ApiError.js";
import documentSlotsRepository from "./documentSlots.repository.js";

class DocumentSlotsService {
  async getAllSlots(userRole) {
    const isAdmin = ["ADMIN", "SUPER_ADMIN"].includes(userRole);
    return documentSlotsRepository.getAll(isAdmin);
  }

  async createSlot(data, userId) {
    if (!data.title || !data.title.trim()) {
      throw new ApiError(400, "Document slot title/heading is required.");
    }

    let code = data.code ? data.code.toUpperCase().trim() : "";
    if (!code) {
      code = data.title
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "_")
        .replace(/_+/g, "_")
        .slice(0, 40);
    }

    const existing = await documentSlotsRepository.getByCode(code);
    if (existing) {
      throw new ApiError(409, `A document slot with code "${code}" already exists.`);
    }

    return documentSlotsRepository.create(
      {
        code,
        title: data.title,
        category: data.category || "GENERAL",
        description: data.description || "",
        isRequiredForLoan: Boolean(data.isRequiredForLoan),
      },
      userId
    );
  }

  async updateSlot(id, data) {
    const existing = await documentSlotsRepository.getById(id);
    if (!existing) {
      throw new ApiError(404, "Document slot not found.");
    }

    return documentSlotsRepository.update(id, data);
  }

  async deleteSlot(id) {
    const existing = await documentSlotsRepository.getById(id);
    if (!existing) {
      throw new ApiError(404, "Document slot not found.");
    }
    if (existing.is_system) {
      throw new ApiError(400, "System core document slots cannot be removed.");
    }

    return documentSlotsRepository.delete(id);
  }
}

export default new DocumentSlotsService();
