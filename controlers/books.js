const Book = require('../models/Book'); // Import the Book model
const asyncWrapper = require('../middlewares/asyncWrapper');
const fs = require('fs');
const path = require('path');

// Get all books
const getAllBooks = asyncWrapper(async (req, res, next) => {
  const books = await Book.find(); // This should return an array of books
  res.status(200).json(books); // Return the array directly
});

// Get a single book by ID
const getSingleBook = asyncWrapper(async (req, res, next) => {
  const { id } = req.params; // Extract the ID from the URL parameters

  const book = await Book.findById(id); // Find the book by ID

  if (!book) {
    return res.status(404).json({ message: 'Book not found' }); // Handle case where book is not found
  }

  res.status(200).json(book); // Return the book data
});

// Get top-rated books
const getTopRatedBooks = asyncWrapper(async (req, res, next) => {
  // Query the database for books, sort by averageRating in descending order, and limit to 3 results
  const topRatedBooks = await Book.find()
    .sort({ averageRating: -1 }) // Sort by averageRating in descending order
    .limit(3); // Limit results to 3

  res.status(200).json(topRatedBooks); // Return the top 3 books
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
  let imageUrl = req.file ? `http://localhost:5000/${req.file.path}` : null;
  imageUrl = imageUrl.replace(/\\/g, '/');

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
});

const updateBook = asyncWrapper(async (req, res, next) => {
  const { id } = req.params;
  let book = req.body;
  const { title, author, year, genre, ratings, averageRating } = book;
  let imageUrl = req.file ? `http://localhost:5000/${req.file.path}` : null;
  imageUrl = imageUrl ? imageUrl.replace(/\\/g, '/') : null;

  // Construct the update object
  const updateFields = {
    ...(title && { title }),
    ...(author && { author }),
    ...(year && { year: parseInt(year, 10) }),
    ...(genre && { genre }),
    ...(ratings && { ratings: JSON.parse(ratings) }),
    ...(averageRating && { averageRating: parseFloat(averageRating) }),
    ...(imageUrl && { imageUrl }),
  };

  // Find the book by ID and update it
  const updatedBook = await Book.findOneAndUpdate(
    { _id: id },
    { $set: updateFields },
    { new: true, runValidators: true } // Options to return the updated document and run validation
  );

  if (!updatedBook) {
    return res.status(404).json({ message: 'Book not found' });
  }

  res.status(200).json({ book: updatedBook });
});

const deleteBook = asyncWrapper(async (req, res, next) => {
  const { id } = req.params;

  // Attempt to delete the book with the specified ID
  const result = await Book.findByIdAndDelete(id);

  if (!result) {
    // If no book was found with the given ID, return a 404 error
    return res.status(404).json({ message: 'Book not found' });
  }

  // If successful, return a 204 status with no content
  res.status(204).send();
});

const addRating = asyncWrapper(async (req, res, next) => {
  const { id } = req.params;
  const { userId, rating } = req.body;

  // Validate the rating
  if (typeof rating !== 'number' || rating < 0 || rating > 5) {
    return res
      .status(400)
      .json({ message: 'Rating must be a number between 0 and 5' });
  }

  // Find the book by ID
  const book = await Book.findById(id);
  if (!book) {
    return res.status(404).json({ message: 'Book not found' });
  }

  // Check if the user has already rated this book
  const existingRating = book.ratings.find((r) => r.userId === userId);
  if (existingRating) {
    return res
      .status(400)
      .json({ message: 'User has already rated this book' });
  }

  // Add the new rating to the ratings array
  book.ratings.push({ userId, grade: rating });

  // Update the average rating
  const totalRatings = book.ratings.length;
  const sumRatings = book.ratings.reduce((acc, r) => acc + r.grade, 0);
  book.averageRating = sumRatings / totalRatings;

  // Save the updated book
  const updatedBook = await book.save();

  // Return the updated book with the new rating
  res
    .status(200)
    .json({ message: 'Rating added successfully', book: updatedBook });
});

module.exports = {
  getAllBooks,
  getSingleBook,
  getTopRatedBooks,
  createBook,
  deleteBook,
  updateBook,
  addRating,
};
