import mongoose from "mongoose";

export const isValidId = (req, res, next) => {
  const { contactId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(contactId)) {
    return res.status(404).json({
      status: 404,
      message: "Contact not found",
    });
  }

  next();
};
