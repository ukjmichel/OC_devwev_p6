const Book = require('../models/Book'); // Adjust the path to your Book model

/**
 * Middleware to check if the user ID from the header matches the user ID associated with the book.
 */
const checkUserIdMatch = async (req, res, next) => {
  try {
    // Extract the book ID from the request parameters
    const { id } = req.params;

    // Extract the user ID from the request headers
    const userIdFromHeader = req.headers['userId'];

    if (!userIdFromHeader) {
      return res
        .status(400)
        .json({ message: 'User ID is required in headers' });
    }

    // Find the book by its ID
    const book = await Book.findById(id);

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Check if the user ID from the header matches the book's user ID
    if (book.userId !== userIdFromHeader) {
      return res
        .status(403)
        .json({ message: 'User not authorized to access this resource' });
    }

    // If the IDs match, proceed to the next middleware
    next();
  } catch (error) {
    console.error('Error in checkUserIdMatch middleware:', error);
    res
      .status(500)
      .json({ message: 'Internal Server Error', error: error.message });
  }
};

module.exports = checkUserIdMatch;
