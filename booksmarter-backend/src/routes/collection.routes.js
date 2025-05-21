const express = require('express');
const CollectionController = require('../controllers/collection.controller');

const router = express.Router();

router.get('/', CollectionController.getAllCollections);
router.get('/:id', CollectionController.getCollectionById);
router.post('/', CollectionController.createCollection);
router.put('/:id', CollectionController.updateCollection);
router.delete('/:id', CollectionController.deleteCollection);

module.exports = router;