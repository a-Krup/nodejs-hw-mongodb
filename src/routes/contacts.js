import express from "express";
import multer from "multer";
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
import authenticate from "../middlewares/authenticate.js";

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.use(authenticate);

router.get("/", ctrlWrapper(getAll));
router.get("/:contactId", isValidId, ctrlWrapper(getById));

router.post(
  "/",
  upload.single("photo"),
  validateBody(createContactSchema),
  ctrlWrapper(create)
);

router.patch(
  "/:contactId",
  isValidId,
  upload.single("photo"),
  validateBody(updateContactSchema),
  ctrlWrapper(update)
);

router.delete("/:contactId", isValidId, ctrlWrapper(remove));

export default router;
