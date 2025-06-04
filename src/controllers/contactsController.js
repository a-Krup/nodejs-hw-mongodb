import { getAllContacts } from '../services/contacts.js';

export async function handleGetAllContacts(req, res, next) {
  try {
    const contacts = await getAllContacts();
    res.status(200).json({
      status: 200,
      message: 'Successfully found contacts!',
      data: contacts
    });
  } catch (error) {
    next(error); // передати помилку до глобального обробника
  }
}