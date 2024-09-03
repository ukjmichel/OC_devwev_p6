const Book = require('../models/Book'); // Import the Book model

const checkBookOwnership = async (req, res, next) => {
  const { id } = req.params; // Extract the book ID from the URL parameters
  const { userId } = req.user; // Extract the user ID from the authenticated user

  try {
    // Find the book by ID
    const book = await Book.findById(id);

    // Check if the book exists
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Check if the authenticated user is the owner of the book
    if (book.userId !== userId) {
      return res
        .status(403)
        .json({ message: 'You do not have permission to perform this action' });
    }

    // Proceed to the next middleware/route handler
    next();
  } catch (error) {
    // Handle any errors that occurred during the process
    next(error);
  }
};

module.exports = checkBookOwnership;
