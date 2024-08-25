const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define the schema for the Book model
// Define the Rating schema
const ratingSchema = new Schema({
  userId: {
    type: String,
    required: true,
  },
  grade: {
    type: Number,
    required: true,
    min: 0,
    max: 10, // Assuming ratings are on a scale from 0 to 10
  },
});

// Define the Book schema
const bookSchema = new Schema({
  userId: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
  },
  year: {
    type: Number,
    required: true,
  },
  genre: {
    type: String,
    required: true, // This makes the genre field required
  },
  ratings: [
    {
      userId: {
        type: String,
        required: true,
      },
      grade: {
        type: Number,
        required: true,
      },
    },
  ],
  averageRating: {
    type: Number,
    default: 0,
    set: function (value) {
      return parseFloat(value).toFixed(2);
    },
  },
});

// Create and export the Book model
const Book = mongoose.model('Book', bookSchema);
module.exports = Book;
