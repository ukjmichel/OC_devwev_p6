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
    const error = new Error('Book not found');
    error.statusCode = 404;
    return next(error); // Pass the error to the error-handling middleware
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
  const { title, author, year, genre, ratings, averageRating } = req.body;
  let imageUrl = req.file ? `http://localhost:5000/${req.file.path}` : null;
  imageUrl = imageUrl.replace(/\\/g, '/');

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
    const error = new Error('Book not found');
    error.statusCode = 404;
    return next(error); // Pass the error to the error-handling middleware
  }

  res.status(200).json({ book: updatedBook });
});

const deleteBook = asyncWrapper(async (req, res, next) => {
  const { id } = req.params;

  // Attempt to delete the book with the specified ID
  const result = await Book.findByIdAndDelete(id);

  if (!result) {
    const error = new Error('Book not found');
    error.statusCode = 404;
    return next(error); // Pass the error to the error-handling middleware
  }

  // If successful, return a 204 status with no content
  res.status(204).send();
});

const addRating = asyncWrapper(async (req, res, next) => {
  const { id } = req.params;
  const { userId, rating } = req.body;

  // Validate the rating
  if (typeof rating !== 'number' || rating < 0 || rating > 5) {
    const error = new Error('Rating must be a number between 0 and 5');
    error.statusCode = 400;
    return next(error); // Pass the error to the error-handling middleware
  }

  // Find the book by ID
  const book = await Book.findById(id);
  if (!book) {
    const error = new Error('Book not found');
    error.statusCode = 404;
    return next(error); // Pass the error to the error-handling middleware
  }

  // Check if the user has already rated this book
  const existingRating = book.ratings.find((r) => r.userId === userId);
  if (existingRating) {
    const error = new Error('User has already rated this book');
    error.statusCode = 400;
    return next(error); // Pass the error to the error-handling middleware
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
  res.status(200).json(updatedBook);
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
