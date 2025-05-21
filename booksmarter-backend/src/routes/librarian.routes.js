const express = require('express');
const LibrarianController = require('../controllers/librarian.controller');

const router = express.Router();

router.get('/', LibrarianController.getAllLibrarians);
router.get('/:id', LibrarianController.getLibrarianById);
router.post('/', LibrarianController.createLibrarian);
router.put('/:id', LibrarianController.updateLibrarian);
router.delete('/:id', LibrarianController.deleteLibrarian);

module.exports = router;