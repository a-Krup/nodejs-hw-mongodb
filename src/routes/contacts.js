import express from "express";
import {
  getAll,
  getById,
  create,
  update,
  remove,
} from "../controllers/contacts.js";
import { ctrlWrapper } from "../utils/ctrlWrapper.js";
import { validateBody } from "../middlewares/validateBody.js";
import { isValidId } from "../middlewares/isValidId.js";
import {
  createContactSchema,
  updateContactSchema,
} from "../schemas/contactsSchemas.js";

const router = express.Router();

router.get("/", ctrlWrapper(getAll));
router.get("/:contactId", isValidId, ctrlWrapper(getById));
router.post("/", validateBody(createContactSchema), ctrlWrapper(create));
router.patch(
  "/:contactId",
  isValidId,
  validateBody(updateContactSchema),
  ctrlWrapper(update)
);
router.delete("/:contactId", isValidId, ctrlWrapper(remove));

export default router;
