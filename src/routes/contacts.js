import express from "express";
import {
  getAll,
  getById,
  create,
  update,
  remove,
} from "../controllers/contacts.js";
import { ctrlWrapper } from "../utils/ctrlWrapper.js";

const router = express.Router();

router.get("/", ctrlWrapper(getAll));
router.get("/:contactId", ctrlWrapper(getById));
router.post("/", ctrlWrapper(create)); // створення нового контакту
router.patch("/:contactId", ctrlWrapper(update)); // оновлення (PATCH)
router.delete("/:contactId", ctrlWrapper(remove)); // видалення

export default router;