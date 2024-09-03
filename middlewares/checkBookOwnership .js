const Book = require('../models/Book'); // Import the Book model
const asyncWrapper = require('./asyncWrapper');

const checkBookOwnership = asyncWrapper(async (req, res, next) => {
  const { id } = req.params; // Extract the book ID from the URL parameters
  const { userId } = req.user; // Extract the user ID from the authenticated user

  try {
    // Find the book by ID
    const book = await Book.findById(id);

    // Check if the book exists
    if (!book) {
      const error = new Error('Book not found');
      error.statusCode = 404;
      return next(error); // Pass the error to the error-handling middleware
    }

    // Check if the authenticated user is the owner of the book
    if (book.userId !== userId) {
      const error = new Error(
        'You do not have permission to perform this action'
      );
      error.statusCode = 403;
      return next(error); // Pass the error to the error-handling middleware
    }

    // Proceed to the next middleware/route handler
    next();
  } catch (error) {
    // Handle any errors that occurred during the process
    next(error);
  }
});

module.exports = checkBookOwnership;
