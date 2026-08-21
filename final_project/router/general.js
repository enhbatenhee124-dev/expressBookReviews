const express = require('express');
let books = require("./booksdb.js");
let auth_users = require("./auth_users.js");
let isValid = auth_users.isValid;
let users = auth_users.users;
const public_users = express.Router();
const axios = require('axios');

const BASE_URL = "http://localhost:5000";

// Register a new user
public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(404).json({ message: "Username and password are required" });
  }
  if (isValid(username)) {
    return res.status(404).json({ message: "User already exists!" });
  }

  users.push({ "username": username, "password": password });
  return res.status(200).json({ message: "User successfully registered. Now you can login" });
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
  return res.status(200).send(JSON.stringify(books, null, 4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (book) {
    return res.status(200).send(JSON.stringify(book, null, 4));
  } else {
    return res.status(404).json({ message: "Book not found for ISBN " + isbn });
  }
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;
  let matching = {};
  Object.keys(books).forEach((key) => {
    if (books[key].author.toLowerCase() === author.toLowerCase()) {
      matching[key] = books[key];
    }
  });
  if (Object.keys(matching).length > 0) {
    return res.status(200).send(JSON.stringify(matching, null, 4));
  } else {
    return res.status(404).json({ message: "No books found by author " + author });
  }
});

// Get book details based on title
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;
  let matching = {};
  Object.keys(books).forEach((key) => {
    if (books[key].title.toLowerCase() === title.toLowerCase()) {
      matching[key] = books[key];
    }
  });
  if (Object.keys(matching).length > 0) {
    return res.status(200).send(JSON.stringify(matching, null, 4));
  } else {
    return res.status(404).json({ message: "No books found with title " + title });
  }
});

// Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (book) {
    return res.status(200).send(JSON.stringify(book.reviews, null, 4));
  } else {
    return res.status(404).json({ message: "Book not found for ISBN " + isbn });
  }
});

module.exports.general = public_users;

/* ------------------------------------------------------------------------
 * Task 11 — Client-side implementations using Axios + async/await.
 * These call this same server's own public endpoints above and resolve
 * the response data via Promises. They are not Express routes; they are
 * plain functions you can import and call from other Node scripts, or
 * run directly with `node router/general.js` while the server (index.js)
 * is running in another terminal.
 * ------------------------------------------------------------------------ */

// Task 10: Get all books using async/await with Axios
async function getAllBooks() {
  try {
    const response = await axios.get(`${BASE_URL}/`);
    return response.data;
  } catch (error) {
    console.error("Error fetching all books:", error.message);
    throw error;
  }
}

// Task 11: Search by ISBN using Promises
function getBookByISBN(isbn) {
  return axios.get(`${BASE_URL}/isbn/${isbn}`)
    .then((response) => response.data)
    .catch((error) => {
      console.error(`Error fetching book with ISBN ${isbn}:`, error.message);
      throw error;
    });
}

// Task 12: Search by Author using async/await
async function getBooksByAuthor(author) {
  try {
    const response = await axios.get(`${BASE_URL}/author/${encodeURIComponent(author)}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching books by author ${author}:`, error.message);
    throw error;
  }
}

// Task 13: Search by Title using async/await
async function getBooksByTitle(title) {
  try {
    const response = await axios.get(`${BASE_URL}/title/${encodeURIComponent(title)}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching books by title ${title}:`, error.message);
    throw error;
  }
}

module.exports.getAllBooks = getAllBooks;
module.exports.getBookByISBN = getBookByISBN;
module.exports.getBooksByAuthor = getBooksByAuthor;
module.exports.getBooksByTitle = getBooksByTitle;

// Demo runner: `node router/general.js` (server must already be running)
if (require.main === module) {
  (async () => {
    console.log("=== getAllBooks() ===");
    console.log(await getAllBooks());

    console.log("=== getBookByISBN('1') ===");
    console.log(await getBookByISBN('1'));

    console.log("=== getBooksByAuthor('Jane Austen') ===");
    console.log(await getBooksByAuthor('Jane Austen'));

    console.log("=== getBooksByTitle('Fairy tales') ===");
    console.log(await getBooksByTitle('Fairy tales'));
  })();
}
