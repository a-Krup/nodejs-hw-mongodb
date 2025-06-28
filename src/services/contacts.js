import { Contact } from "../models/contactModel.js";

export const getAllContacts = async (
  userId,
  page = 1,
  perPage = 10,
  sortBy = "name",
  sortOrder = 1
) => {
  const skip = (page - 1) * perPage;

  const [data, totalItems] = await Promise.all([
    Contact.find({ userId })
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(perPage),
    Contact.countDocuments({ userId }),
  ]);

  const totalPages = Math.ceil(totalItems / perPage);
  const hasPreviousPage = page > 1;
  const hasNextPage = page < totalPages;

  return {
    data,
    page,
    perPage,
    totalItems,
    totalPages,
    hasPreviousPage,
    hasNextPage,
  };
};

export const getContactById = async (contactId, userId) => {
  return await Contact.findOne({ _id: contactId, userId });
};

export const createContact = async (contactData) => {
  return await Contact.create(contactData);
};

export const updateContact = async (contactId, userId, updateData) => {
  return await Contact.findOneAndUpdate(
    { _id: contactId, userId },
    updateData,
    { new: true }
  );
};

export const deleteContact = async (contactId, userId) => {
  return await Contact.findOneAndDelete({ _id: contactId, userId });
};
