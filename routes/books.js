const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authentication');
const checkBookOwnership = require('../middlewares/checkBookOwnership ');
const imageProcessor = require('../middlewares/imageProcessor'); // For handling file uploads
const {
  getAllBooks,
  getSingleBook,
  getTopRatedBooks,
  createBook,
  deleteBook,
  updateBook,
  addRating,
} = require('../controlers/books');

router.get('/bestrating', getTopRatedBooks);

router.get('/', getAllBooks).post('/', auth, createBook);

router
  .get('/:id', auth, getSingleBook)
  .put('/:id', auth, checkBookOwnership, imageProcessor, updateBook)
  .delete('/:id', auth, checkBookOwnership, deleteBook);

router.post('/:id/rating', auth, addRating);

module.exports = router;
