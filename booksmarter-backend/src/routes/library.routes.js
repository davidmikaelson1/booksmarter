const express = require('express');
const LibraryController = require('../controllers/library.controller');

const router = express.Router();

router.get('/', LibraryController.getAllLibraries);
router.get('/:id', LibraryController.getLibraryById);
router.post('/', LibraryController.createLibrary);
router.put('/:id', LibraryController.updateLibrary);
router.delete('/:id', LibraryController.deleteLibrary);

module.exports = router;