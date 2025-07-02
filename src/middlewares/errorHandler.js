export function errorHandler(err, req, res, next) {
  console.error("Error caught:", err);
  const status = err.status || 500;
  const message = err.message || "Something went wrong";

  const response = { status, message };

  res.status(status).json(response);
}
