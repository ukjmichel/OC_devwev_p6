const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authentication');
const multer = require('../middlewares/multer-config'); // For handling file uploads
const {
  getAllBooks,
  getSingleBook,
  getTopRatedBooks,
  createBook,
  deleteBook,
  updateBook,
} = require('../controlers/books');

// Route to get books with the best rating
router.get('/bestrating', getTopRatedBooks);

// Route to get all books
router.get('/', getAllBooks);

// Route to get a book by ID
router.get('/:id', getSingleBook);

// Route to create a new book
router.post('/', auth, multer.single('image'), createBook);

// Route to update a book by ID
router.put('/:id', auth, updateBook);

// Route to delete a book by ID
router.delete('/:id', auth, deleteBook);

// Route to add a rating to a book by ID
router.post('/:id/rating', auth, (req, res) => {
  res.json(`Add Rating to Book: ${req.params.id}`);
});

module.exports = router;
