const Book = require('../models/Book'); // Import the Book model
const asyncWrapper = require('../middlewares/asyncWrapper');

// Get all books
const getAllBooks = asyncWrapper(async (req, res, next) => {
  try {
    const books = await Book.find(); // This should return an array of books
    res.status(200).json(books); // Return the array directly
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Get a single book by ID
const getSingleBook = asyncWrapper(async (req, res, next) => {
  const { id } = req.params; // Extract the ID from the URL parameters

  try {
    const book = await Book.findById(id); // Find the book by ID

    if (!book) {
      return res.status(404).json({ message: 'Book not found' }); // Handle case where book is not found
    }

    res.status(200).json(book); // Return the book data
  } catch (error) {
    console.error('Error fetching book:', error);
    res.status(500).json({ message: 'Internal Server Error' }); // Handle server error
  }
});

// Get top-rated books
const getTopRatedBooks = asyncWrapper(async (req, res, next) => {
  try {
    // Query the database for books, sort by averageRating in descending order, and limit to 3 results
    const topRatedBooks = await Book.find()
      .sort({ averageRating: -1 }) // Sort by averageRating in descending order
      .limit(3); // Limit results to 3

    res.status(200).json(topRatedBooks); // Return the top 3 books
  } catch (error) {
    console.error('Error fetching top rated books:', error);
    res.status(500).json({ message: 'Internal Server Error' }); // Handle server error
  }
});

// Create a new book
const createBook = asyncWrapper(async (req, res, next) => {
  // Extract data from request
  let newBook = req.body.book;

  // If `newBook` is a JSON string, parse it
  if (typeof newBook === 'string') {
    newBook = JSON.parse(newBook);
  }

  // Convert year to number if it's not already
  newBook.year = parseInt(newBook.year, 10);

  console.log(newBook);

  // Extract properties from the newBook object
  const { userId, title, author, year, genre, ratings, averageRating } =
    newBook;

  // Handle file upload
  const imageUrl = req.file ? req.file.path : null;

  try {
    // Create a new Book instance
    const book = new Book({
      userId,
      title,
      author,
      imageUrl,
      year,
      genre,
      ratings: Array.isArray(ratings) ? ratings : [], // Ensure ratings is an array
      averageRating:
        typeof averageRating === 'number'
          ? averageRating
          : parseFloat(averageRating) || 0,
    });

    // Save the book to the database
    const savedBook = await book.save();

    // Respond with the saved book
    res.status(201).json({ book: savedBook });
  } catch (error) {
    console.error('Error creating book:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

const updateBook = asyncWrapper(async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Use findOneAndUpdate to update the book with the given ID
    const updatedBook = await Book.findOneAndUpdate(
      { _id: id },
      { $set: updateData }, // Update the fields provided in the request body
      { new: true, runValidators: true } // Return the updated document and run schema validations
    );

    if (!updatedBook) {
      // If no book was found with the given ID, return a 404 error
      return res.status(404).json({ message: 'Book not found' });
    }

    // If successful, return the updated book with a 200 status
    res
      .status(200)
      .json({ message: 'Book updated successfully', book: updatedBook });
  } catch (error) {
    console.error('Error updating book:', error);
    res.status(500).json({ message: 'Internal Server Error' }); // Handle server error
  }
});

const deleteBook = asyncWrapper(async (req, res, next) => {
  try {
    const { id } = req.params;

    // Attempt to delete the book with the specified ID
    const result = await Book.findByIdAndDelete(id);

    if (!result) {
      // If no book was found with the given ID, return a 404 error
      return res.status(404).json({ message: 'Book not found' });
    }

    // If successful, return a 204 status with no content
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting book:', error);
    res.status(500).json({ message: 'Internal Server Error' }); // Handle server error
  }
});

module.exports = {
  getAllBooks,
  getSingleBook,
  getTopRatedBooks,
  createBook,
  deleteBook,
  updateBook,
};
