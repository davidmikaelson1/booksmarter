require('dotenv').config();

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser'); // Add this

// Import routes
const indexRoutes = require('./routes/index.routes');
const bookRoutes = require('./routes/book.routes');
const authRoutes = require('./routes/auth.routes');
const orderRoutes = require('./routes/order.routes');
const userRoutes = require('./routes/user.routes');
const readerRoutes = require('./routes/reader.routes');
const librarianRoutes = require('./routes/librarian.routes');
const collectionRoutes = require('./routes/collection.routes');
const bookInstanceRoutes = require('./routes/bookInstance.routes');
const orderItemRoutes = require('./routes/orderItem.routes');
const libraryRoutes = require('./routes/library.routes');
const instancesRoutes = require('./routes/instances.routes');

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:4200',
  credentials: true
}));
app.use(cookieParser()); // Add this middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', indexRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/readers', readerRoutes);
app.use('/api/librarians', librarianRoutes);
app.use('/api/collections', collectionRoutes);
app.use('/api/book-instances', bookInstanceRoutes);
app.use('/api/order-items', orderItemRoutes);
app.use('/api/terminals', libraryRoutes);
app.use('/api/instances', instancesRoutes);

app.get('/', (req, res) => {
  res.send('Welcome to the BookSmarter API!');
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  const statusCode = err.status || 500;
  const message = err.message || 'Something went wrong!';
  res.status(statusCode).json({ error: message });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Export the app
module.exports = app;