import { Contact } from "../models/contactModel.js";

export async function getAllContacts() {
  return Contact.find();
}

export async function getContactById(id) {
  return Contact.findById(id);
}

export async function createContact(contactData) {
  return Contact.create(contactData);
}

export async function updateContact(id, updateData) {
  return Contact.findByIdAndUpdate(id, updateData, { new: true });
}

export async function deleteContact(id) {
  return Contact.findByIdAndDelete(id);
}