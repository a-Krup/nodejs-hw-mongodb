import createHttpError from "http-errors";
import {
  getAllContacts,
  getContactById,
  createContact as createContactService,
  updateContact as updateContactService,
  deleteContact as deleteContactService,
} from "../services/contacts.js";

export const getAll = async (req, res, next) => {
  try {
    const { _id: userId } = req.user;
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 10;
    const sortBy = req.query.sortBy || "name";
    const sortOrder = req.query.sortOrder === "desc" ? -1 : 1;

    const result = await getAllContacts(
      userId,
      page,
      perPage,
      sortBy,
      sortOrder
    );

    res.status(200).json({
      status: 200,
      message: "Successfully found contacts!",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const getById = async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const { _id: userId } = req.user;

    const contact = await getContactById(contactId, userId);

    if (!contact) {
      throw createHttpError(404, "Contact not found");
    }

    res.status(200).json({
      status: 200,
      message: `Successfully found contact with id ${contactId}!`,
      data: contact,
    });
  } catch (err) {
    next(err);
  }
};

export const create = async (req, res, next) => {
  try {
    const { _id: userId } = req.user;

    const { name, phoneNumber, contactType } = req.body;

    if (!name || !phoneNumber || !contactType) {
      throw createHttpError(
        400,
        "Missing required fields: name, phoneNumber, contactType"
      );
    }

    const newContact = await createContactService({ ...req.body, userId });

    res.status(201).json({
      status: 201,
      message: "Successfully created a contact!",
      data: newContact,
    });
  } catch (err) {
    next(err);
  }
};

export const update = async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const { _id: userId } = req.user;
    const updateData = req.body;

    const updatedContact = await updateContactService(
      contactId,
      userId,
      updateData
    );

    if (!updatedContact) {
      throw createHttpError(404, "Contact not found");
    }

    res.status(200).json({
      status: 200,
      message: "Successfully patched a contact!",
      data: updatedContact,
    });
  } catch (err) {
    next(err);
  }
};

export const remove = async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const { _id: userId } = req.user;

    const deletedContact = await deleteContactService(contactId, userId);

    if (!deletedContact) {
      throw createHttpError(404, "Contact not found");
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
