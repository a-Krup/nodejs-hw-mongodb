export function errorHandler(err, req, res, next) {
  console.error("Error caught:", err);

  if (err.name === "CastError" && err.path === "_id") {
    return res.status(404).json({
      status: 404,
      message: "Contact not found",
      data: { message: "Contact not found" },
    });
  }

  const status = err.status || 500;
  const message = err.message || "Something went wrong";

  const response = { status, message };

  res.status(status).json(response);
}
