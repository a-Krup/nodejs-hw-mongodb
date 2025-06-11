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
router.post("/", ctrlWrapper(create));
router.patch("/:contactId", ctrlWrapper(update));
router.delete("/:contactId", ctrlWrapper(remove));

export default router;
