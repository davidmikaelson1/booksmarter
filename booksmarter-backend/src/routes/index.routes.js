const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const bookRoutes = require('./book.routes');
const collectionRoutes = require('./collection.routes');
const orderRoutes = require('./order.routes');

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/books', bookRoutes);
router.use('/collections', collectionRoutes);
router.use('/orders', orderRoutes);

module.exports = router;