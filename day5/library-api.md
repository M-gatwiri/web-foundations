# Library REST API Design

## Overview

This document describes a RESTful API for managing books in a library. The API allows users to retrieve, create, update, and delete books, as well as find books written by a particular author.

**Base URL:** `/api`

## 1. List All Books

* **Method:** `GET`
* **Path:** `/api/books`
* **Description:** Retrieves a list of all books in the library.
* **Success status code:** `200 OK`
* **Request body:** Not required.

## 2. Get a Single Book

* **Method:** `GET`
* **Path:** `/api/books/{id}`
* **Description:** Retrieves the details of a specific book using its ID.
* **Success status code:** `200 OK`
* **Request body:** Not required.

**Example request:**

```http
GET /api/books/42
```

## 3. Create a New Book

* **Method:** `POST`
* **Path:** `/api/books`
* **Description:** Creates a new book in the library.
* **Success status code:** `201 Created`

**Example request body:**

```json
{
  "title": "Things Fall Apart",
  "author": "Chinua Achebe",
  "publishedYear": 1958
}
```

## 4. Update a Book

* **Method:** `PUT`
* **Path:** `/api/books/{id}`
* **Description:** Replaces the details of an existing book.
* **Success status code:** `200 OK`

**Example request:**

```http
PUT /api/books/42
```

**Example request body:**

```json
{
  "title": "Things Fall Apart",
  "author": "Chinua Achebe",
  "publishedYear": 1958
}
```

## 5. Delete a Book

* **Method:** `DELETE`
* **Path:** `/api/books/{id}`
* **Description:** Deletes a specific book from the library.
* **Success status code:** `204 No Content`
* **Request body:** Not required.

**Example request:**

```http
DELETE /api/books/42
```

## 6. List Books by Author

* **Method:** `GET`
* **Path:** `/api/books?author={authorName}`
* **Description:** Retrieves books written by the specified author using a query parameter.
* **Success status code:** `200 OK`
* **Request body:** Not required.

**Example request:**

```http
GET /api/books?author=Chinua%20Achebe
```

The query parameter `author` filters the books by author name. `%20` represents a space in the URL.

## Error Status Codes

### 400 Bad Request

* **Description:** The server cannot process the request because the submitted data is invalid or the request is incorrectly formatted.
* **Example:** A client attempts to create a book without a required title or submits an invalid publication year.

### 404 Not Found

* **Description:** The requested resource cannot be found.
* **Example:** A client requests `/api/books/999` when no book with ID `999` exists.

## Summary

This API follows RESTful conventions by using HTTP methods to describe actions and resource-based paths to identify books.

* `GET` retrieves resources.
* `POST` creates a resource.
* `PUT` replaces a
