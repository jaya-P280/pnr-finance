import { Router } from "express";
import authenticate from "../auth/auth.middleware.js";
import authorize from "../../middleware/authorize.middleware.js";
import validateRequest from "../../middleware/validation.middleware.js";
import collectionController from "./collections.controller.js";
import { createCollectionValidation, listCollectionsValidation, collectionIdValidation } from "./collections.validation.js";

const router = Router();

router.post("/", authenticate, authorize("COLLECTION_CREATE"), createCollectionValidation, validateRequest, collectionController.create);
router.get("/", authenticate, authorize("COLLECTION_VIEW"), listCollectionsValidation, validateRequest, collectionController.list);
router.get("/summary", authenticate, authorize("COLLECTION_VIEW"), collectionController.summary);
router.get("/:id", authenticate, authorize("COLLECTION_VIEW"), collectionIdValidation, validateRequest, collectionController.getById);
router.put("/:id", authenticate, authorize("COLLECTION_UPDATE"), collectionIdValidation, validateRequest, collectionController.update);
router.delete("/:id", authenticate, authorize("COLLECTION_DELETE"), collectionIdValidation, validateRequest, collectionController.delete);

export default router;