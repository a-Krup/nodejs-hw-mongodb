export const getAllContacts = (req, res) => {
  res.json({ message: "GET all contacts" });
};

export const getContactById = (req, res) => {
  res.json({ message: `GET contact with ID ${req.params.id}` });
};

export const createContact = (req, res) => {
  res.json({ message: "POST new contact", data: req.body });
};

export const updateContact = (req, res) => {
  res.json({ message: `PUT contact with ID ${req.params.id}`, data: req.body });
};

export const deleteContact = (req, res) => {
  res.json({ message: `DELETE contact with ID ${req.params.id}` });
};