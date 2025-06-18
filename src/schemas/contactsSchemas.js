import Joi from "joi";

const stringField = Joi.string().min(3).max(20);

export const createContactSchema = Joi.object({
  name: stringField.required(),
  phoneNumber: stringField.required(),
  email: stringField.email().min(3).max(50).optional(),
  isFavourite: Joi.boolean().optional(),
  contactType: Joi.string().valid("work", "home", "personal").required(),
});

export const updateContactSchema = Joi.object({
  name: stringField.optional(),
  phoneNumber: stringField.optional(),
  email: stringField.email().min(3).max(50).optional(),
  isFavourite: Joi.boolean().optional(),
  contactType: Joi.string().valid("work", "home", "personal").optional(),
}).min(1);
