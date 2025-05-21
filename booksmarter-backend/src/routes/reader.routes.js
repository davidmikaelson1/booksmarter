const express = require('express');
const ReaderController = require('../controllers/reader.controller');

const router = express.Router();

router.get('/', ReaderController.getAllReaders);
router.get('/:id', ReaderController.getReaderById);
router.post('/', ReaderController.createReader);
router.put('/:id', ReaderController.updateReader);
router.delete('/:id', ReaderController.deleteReader);

module.exports = router;