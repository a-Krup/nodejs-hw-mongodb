export function errorHandler(err, req, res, next) {
  console.error('Error caught:', err);
  res.status(err.status || 500).json({
    status: err.status || 500,
    message: err.message || 'Something went wrong',
    data: err.data || err.stack,
  });
}
