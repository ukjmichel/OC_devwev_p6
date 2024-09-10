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
        max: 10, // Assuming ratings are on a scale from 0 to 10
      },
    },
  ],
});

// Virtual field to calculate the average rating
bookSchema.virtual('averageRating').get(function () {
  if (this.ratings.length === 0) return 0; // No ratings, return 0

  // Sum all the grades
  const total = this.ratings.reduce((sum, rating) => sum + rating.grade, 0);

  // Calculate the average and return it, formatted to 2 decimal places
  return (total / this.ratings.length).toFixed(2);
});

// Ensure virtual fields are serialized in JSON
bookSchema.set('toJSON', { virtuals: true });

// Create and export the Book model
const Book = mongoose.model('Book', bookSchema);
module.exports = Book;
