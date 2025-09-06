function notFound(req, res, next) {
  res.status(404).json({ message: 'Not found' });
}
function handler(err, req, res, next) {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({ message: err.message || 'Server error' });
}
module.exports = { notFound, handler };
