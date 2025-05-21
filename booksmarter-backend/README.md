# BookSmarter Backend

## Overview
BookSmarter is a library management system that allows users to manage books, collections, orders, and user accounts. The application is built using Node.js and Express, providing a RESTful API for frontend applications.

## Features
- User authentication (signup and login)
- Management of books (add, update, retrieve)
- Management of book collections
- Order management (create and retrieve orders)
- User management (registration and user details retrieval)

## Project Structure
```
booksmarter-backend
├── src
│   ├── controllers          # Contains controllers for handling requests
│   ├── models               # Contains models defining the schema for entities
│   ├── repositories          # Contains repository files for database interactions
│   ├── routes               # Contains route definitions for the API
│   ├── services             # Contains business logic for the application
│   ├── app.js               # Entry point of the application
│   └── connection.js        # Database connection management
├── package.json             # npm configuration file
├── .env                     # Environment variables
└── README.md                # Project documentation
```

## Installation
1. Clone the repository:
   ```
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```
   cd booksmarter-backend
   ```
3. Install dependencies:
   ```
   npm install
   ```
4. Create a `.env` file in the root directory and add your environment variables (e.g., database connection strings, JWT secret).

## Usage
To start the application, run:
```
npm start
```
The server will start on the specified port (default is 3000).

## API Endpoints
- **Authentication**
  - `POST /api/auth/signup` - Register a new user
  - `POST /api/auth/login` - Login an existing user

- **Users**
  - `GET /api/users/:id` - Retrieve user details

- **Books**
  - `POST /api/books` - Add a new book
  - `GET /api/books` - Retrieve all books

- **Collections**
  - `POST /api/collections` - Create a new book collection
  - `GET /api/collections` - Retrieve all collections

- **Orders**
  - `POST /api/orders` - Create a new order
  - `GET /api/orders` - Retrieve all orders

## Contributing
Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## License
This project is licensed under the MIT License.