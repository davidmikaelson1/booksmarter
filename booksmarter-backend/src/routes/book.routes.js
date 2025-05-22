const express = require('express');
const BookController = require('../controllers/book.controller');

const router = express.Router();

router.get('/', BookController.getAllBooks);
router.get('/:id', BookController.getBookById);
router.post('/', BookController.createBook);
router.post('/batch', BookController.getBooksByIds);
router.put('/:id', BookController.updateBook);
router.delete('/:id', BookController.deleteBook);

module.exports = router;