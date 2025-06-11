import createError from "http-errors";
import { getAllContacts, getContactById } from "../services/contacts.js";

export async function handleGetAllContacts(req, res, next) {
  try {
    const contacts = await getAllContacts();

    res.status(200).json({
      status: 200,
      message: "Successfully found contacts!",
      data: contacts,
    });
  } catch (error) {
    next(error);
  }
}

export async function handleGetContactById(req, res, next) {
  try {
    const { contactId } = req.params;
    const contact = await getContactById(contactId);

    if (!contact) {
      throw createError(404, "Contact not found");
    }

    res.status(200).json({
      status: 200,
      message: `Successfully found contact with id ${contactId}!`,
      data: contact,
    });
  } catch (error) {
    next(error);
  }
}
