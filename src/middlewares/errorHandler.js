export function errorHandler(err, req, res, next) {
  console.error("Error caught:", err);

  if (err.name === "CastError" && err.path === "_id") {
    return res.status(404).json({
      status: 404,
      message: "Contact not found",
      data: { message: "Contact not found" },
    });
  }

  if (err.isJoi) {
    return res.status(400).json({
      status: 400,
      message: err.details[0].message,
      data: null,
    });
  }

  if (err.isHttpError) {
    return res.status(err.status).json({
      status: err.status,
      message: err.message,
      data: null,
    });
  }

  if (err.name === "ValidationError") {
    return res.status(422).json({
      status: 422,
      message: `Validation error: ${err.message}`,
      data: null,
    });
  }

  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    return res.status(401).json({
      status: 401,
      message: "Invalid or expired token.",
      data: null,
    });
  }

  const status = err.status || 500;
  const message = err.message || "Something went wrong";

  const response = { status, message };

  res.status(status).json(response);
}
