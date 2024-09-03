const errorHandler = (err, req, res, next) => {
  // Set the status code from the error, or default to 500 (Internal Server Error)
  const statusCode = err.statusCode || 500;

  // Set the response status and send a JSON object with the error message
  res.status(statusCode).json({
    success: false, // Optional: Include a success field to indicate failure
    error: err.message || 'Server Error', // Send the error message or a default message
  });
};

module.exports = errorHandler;
