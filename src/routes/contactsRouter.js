import express from 'express';
import { handleGetAllContacts } from '../controllers/contactsController.js';

const router = express.Router();
console.log('--- Mounting /contacts router');

// ✅ правильно:
router.get('/', handleGetAllContacts);



export default router;