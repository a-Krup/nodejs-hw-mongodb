export function errorHandler(err, req, res, next) {
  console.error(err);

  res.status(err.status || 500).json({
    status: err.status || 500,
    message: "Something went wrong",
    data: err.message,
  });
}
