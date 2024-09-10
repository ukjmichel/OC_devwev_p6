const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define the schema for the Book model
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
        min: 0,
        max: 5,
      },
    },
  ],
  averageRating: {
    type: Number,
    default: 0, // Set default to 0
  },
});

// Middleware to calculate the average rating before saving
bookSchema.pre('save', function (next) {
  if (this.ratings.length === 0) {
    this.averageRating = 0;
  } else {
    const sumRatings = this.ratings.reduce(
      (sum, rating) => sum + rating.grade,
      0
    );
    this.averageRating = (sumRatings / this.ratings.length).toFixed(2); // Calculate the average rating
  }
  next();
});

// Create and export the Book model
const Book = mongoose.model('Book', bookSchema);
module.exports = Book;
