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
  try {
    // Parse book data from the request body
    const newBook =
      typeof req.body.book === 'string'
        ? JSON.parse(req.body.book)
        : req.body.book;

    // Ensure the year is a number
    newBook.year = Number(newBook.year) || null;

    // Handle image upload and generate the image URL
    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
    const imageUrl = req.processedImage
      ? `${baseUrl}/uploads/${req.processedImage.filename}`
      : null;

    // Create a new Book instance
    const book = new Book({
      ...newBook,
      imageUrl,
      ratings: Array.isArray(newBook.ratings) ? newBook.ratings : [],
    });

    // Save the book to the database
    const savedBook = await book.save();

    // Respond with the saved book
    res.status(201).json({ book: savedBook });
  } catch (error) {
    // If book creation fails after image processing, consider removing the processed image
    if (req.processedImage && fs.existsSync(req.processedImage.filepath)) {
      fs.unlinkSync(req.processedImage.filepath);
    }
    // Pass the error to the next middleware
    next(error);
  }
});

const updateBook = asyncWrapper(async (req, res, next) => {
  const { id } = req.params;

  // Initialize updateFields with request body
  let updateFields = req.body;

  // If the 'book' field is sent as a JSON string, parse it
  if (typeof updateFields.book === 'string') {
    updateFields = JSON.parse(updateFields.book);
  }

  // Ensure the year is converted to a number
  if (updateFields.year) {
    const year = parseInt(updateFields.year, 10);
    if (isNaN(year)) {
      return res.status(400).json({ message: 'Year must be a valid number' });
    }
    updateFields.year = year;
  }

  // If there is a processed image, add the image URL to the updateFields
  if (req.processedImage) {
    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
    updateFields.imageUrl = `${baseUrl}/uploads/${req.processedImage.filename}`;
  }

  // Handle ratings if provided
  if (updateFields.ratings) {
    try {
      updateFields.ratings = JSON.parse(updateFields.ratings);
    } catch (error) {
      return res.status(400).json({ message: 'Invalid ratings format' });
    }
  }

  try {
    // Find the book by ID and update it
    const updatedBook = await Book.findOneAndUpdate(
      { _id: id },
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!updatedBook) {
      return res.status(404).json({ message: 'Book not found' });
    }

    res.status(200).json(updatedBook);
  } catch (error) {
    // If there was an error during update, handle it here
    next(error);
  }
});

const deleteBook = asyncWrapper(async (req, res, next) => {
  const { id } = req.params;

  try {
    // Find the book and delete it
    const book = await Book.findByIdAndDelete(id);

    // If book is not found, return an error
    if (!book) {
      const error = new Error('Book not found');
      error.statusCode = 404;
      return next(error);
    }

    // If the book had an associated image, delete the image file
    if (book.imageUrl) {
      const imagePath = path.join(
        __dirname,
        '../uploads',
        path.basename(book.imageUrl)
      );
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    // Respond with a success message
    res.status(200).json({ message: `The book with id ${id} was deleted` });
  } catch (error) {
    // Handle unexpected errors
    next(error);
  }
});

const addRating = asyncWrapper(async (req, res, next) => {
  const { id } = req.params;
  const { userId, rating } = req.body;

  if (typeof rating !== 'number' || rating < 0 || rating > 10) {
    const error = new Error('Rating must be a number between 0 and 10');
    error.statusCode = 400;
    return next(error);
  }

  const book = await Book.findById(id);
  if (!book) {
    const error = new Error('Book not found');
    error.statusCode = 404;
    return next(error);
  }

  const existingRating = book.ratings.find((r) => r.userId === userId);
  if (existingRating) {
    const error = new Error('User has already rated this book');
    error.statusCode = 400;
    return next(error);
  }

  // Add the new rating
  book.ratings.push({ userId, grade: rating });

  // Save the book (this will trigger the pre-save hook and recalculate the average rating)
  const updatedBook = await book.save();

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
