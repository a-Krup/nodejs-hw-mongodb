import { Contact } from '../models/contactModel.js';

export async function getAllContacts() {
  const contacts = await Contact.find();
  return contacts;
}