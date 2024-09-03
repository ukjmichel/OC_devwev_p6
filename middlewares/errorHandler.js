const errorHandler = (err, req, res, next) => {
  // Set the status code from the error, or default to 500 (Internal Server Error)
  const statusCode = err.statusCode || 500;

  // Create the error response object
  const errorResponse = {
    success: false, // Indicating the request was not successful
    status: statusCode, // HTTP status code
    message: err.message || 'An unexpected error occurred', // Error message
    // Optionally include stack trace in development mode
    // stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  };

  // Send the error response
  res.status(statusCode).json(errorResponse);
};

module.exports = errorHandler;
