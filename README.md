# Mapped Routes

[![Build Status](https://www.travis-ci.com/purplnay/mapped-routes.svg?branch=main)](https://www.travis-ci.com/purplnay/mapped-routes)
![Version](https://img.shields.io/npm/v/mapped-routes)
[![Prettier](https://img.shields.io/badge/styled%20with-prettier-ff69b4)](https://prettier.io/)
![License](https://img.shields.io/github/license/purplnay/mapped-routes)


[Next.js](https://nextjs.org/docs/api-routes/introduction) style dynamic route mapping for [Express](https://expressjs.com/), with support for HTTP methods, custom error handling and more.

# Table of Contents

- [Usage](#usage)
- [Installation](#installation)
- [Documentation](#documentation)
  - [Creating Routes](#creating-routes)
  - [MappedRoutes() options](#mappedroutes-options)
  - [Route handlers](#route-handlers)
  - [Handling specific methods](#handling-specific-methods)
  - [Using middlewares](#using-middlewares)
  - [Using an error handler](#using-an-error-handler)
  - [Using an interceptor](#using-an-interceptor)
- [Using with Typescript](#using-with-typescript)
- [Contributions](#contributions)

# Usage

Create a route for `/api/users`:

```javascript
// api/users/index.js

export default function (req, res) {
  res.end('Get a list of users')
}
```

Create a GET and a PATCH route for `/api/posts/:id`:

```javascript
// api/posts/[id].js

export function get(req, res) {
  const id = req.params.id

  res.end(`Get post ${id}`)
}

// You can also use `return` instead of the Response object.
export function patch(req, res) {
  const id = req.params.id
  const body = req.body

  return `Patch post ${id} with data ${body}`
}
```

Automatically map the `/api` routes to an Express app:

```javascript
import express from 'express'
import { MappedRoutes } from 'mapped-routes'

const app = express()

// The directory where your routes are
const dir = __dirname + '/api'

// Load the routes as a regular Express Router.
app.use('/api', MappedRoutes(dir))

app.listen(3000)
```

# Installation

- With **Yarn**:
  ```bash
  yarn add mapped-routes
  ```

- with **npm**:

  ```bash
  npm install mapped-routes
  ```

The library is typed for Typescript and uses Express as peer dependency, make sure you already have Express installed in your project.

# Documentation

The full reference is available [here](https://purplnay.github.io/mapped-routes/).

## Creating routes

The path that the routes are mapped with is the same as for [Next.js](https://nextjs.org/docs/api-routes/introduction) apps:

- `users/index.js` will match requests to `/users`
- `users/[id].js` will match requests to `/users/:id` where `:id` is a dynamic parameter.
- `posts/[id]/index.js` will match `/posts/:id` where `:id` is a dynamic parameter.

You can have nested parameters, which means that the file `posts/[postId]/comments/[id]/index.js` will match the route `/posts/:postId/comments/:id`.

You can name the folder that contains your routes with any name that you wish. Once you created your folder with some routes, you can add it to your Express app like so:

- Import the MappedRoutes function:

  ```javascript
  const { MappedRoutes } = require('mapped-routes')
  ```

- Generate the Router and add it to your Express app:

  ```javascript
  // Generate a Router
  const apiRouter = MappedRoutes(__dirname + '/api')

  // Add the router to your express app like you normally do
  app.use(apiRouter)
  ```

- You can also use a base path for the router:
  ```javascript
  const authRouter = MappedRoutes(__dirname + '/auth')

  // Use this router for the /auth path
  app.use('/auth', authRouter)
  ```

## MappedRoutes options

The `MappedRoutes()` function takes 2 parameters.

- The first one is the **absolute path** to the directory that contains your routes:

  ```javascript
  MappedRoutes(__dirname + '/path/to/my/routes')
  ```

- The second one is an object with configuration options for your router:

  ```javascript
  const options = {
    // Middlewares to use before the routes of this router
    middlewares: [
      bodyParser.json(),
      myCustomMiddleware,
    ],

    // A function to run when a route throws an error.
    // Setting this parameter will override Express' default error handler
    // for this router.
    errorHandler: (req, res, err) => {
      console.error(err)

      res.json({
        error: true,
        data: content
      })
    },

    // A function to run when a route successfully executed.
    // The third argument is the value returned by the route function.
    interceptor: (req, res, content) => {
      res.json({
        error: false,
        data: content
      })
    }
  }

  const router = MappedRoutes(__dirname + '/api', options)
  ```

The options parameter is optional.

## Route handlers

To create a route handler in one of your route files, simply export a function:

```javascript
// api/users/index.js

export default function(req, res) {
  res.end('List of users')
}
```

You can also return a value instead of using the `Response` object:

```javascript
// api/users/index.js

export default function () {
  return 'List of users'
}
```

Async functions work as well:

```javascript
// api/users/index.js

import { findAllUsers } from 'some-db-helper'

export default async function () {
  return await findAllUsers()
}

```

## Handling specific methods

To handle only GET requests, export a function called `get`:

```javascript
// api/users/index.js

export function get() {
  return 'List of users'
}
```

You can also use arrow functions:

```javascript
// api/users/index.js

export const get = () => {
  return 'List of users'
}
```

Handling GET and POST requests:

```javascript
// api/users/index.js

export const get = () => {
  return 'List of users'
}

export const post = req => {
  return `Create a user named: ${req.body.name}`
}
```

`DELETE` is a special case because it is a reserved keyword in JavaScript, so the word `del` is used instead of `delete`:

```javascript
// api/users/[id].js

export const del = req => {
  return `Delete user ${req.params.id}`
}
```

## Using middlewares

As we saw in the [MappedRoutes() Options](#mappedroutes-options), you can define middlewares for your router to use, but you can also define middlewares for individual routes.

To use middlewares for specific routes, simply export an array named `middlewares` containing a list of middlewares to use:

```javascript
// api/users/index.js

export const middlewares = [
  someMiddleware,
  someOtherMiddleware
]

export default function() {
  return 'List of users'
}
```

You can also define middlewares for specific methods only:

- Middlewares for a `GET` method:

  ```javascript
  // api/users/index.js

  export const getMiddlewares = [
    someMiddleware,
    someOhterMiddleware
  ]
  ```

- Middlewares for a `POST` method:

  ```javascript
  // api/users/index.js

  export const postMiddlewares = [
    someMiddleware,
    someOhterMiddleware
  ]
  ```

- Middlewares for a `DELETE` method:

  ```javascript
  // api/users/index.js

  export const delMiddlewares = [
    someMiddleware,
    someOhterMiddleware
  ]
  ```
  
- Middlewares for all methods, and some for specific methods:

  ```javascript
  // api/users/index.js

  export const middlewares = [
    bodyParser.json(),
    analyticsMiddleware
  ]

  export const getMiddlewares = [
    someMiddleware
  ]

  export function get() {
    // bodyParser was executed
    // analyticsMiddleware was executed
    // someMiddleware was executed

    return 'List of users'
  }

  export const postMiddlewares = [
    authMiddleware,
    anotherMiddleware
  ]

  export function post() {
    // bodyParser was executed
    // analyticsMiddleware was executed
    // authMiddleware was executed
    // anotherMiddleware was executed

    return 'User created'
  }
  ```

The middlewares within the mapped routes are executed in that order:
- Middlewares from the `middleware` options in `MappedRoutes()`.
- Middlewares exported from `export const middlewares = []` in the route files.
- Method-specific middlewares.

## Using an error handler

You can use a custom error handler to handle errors that occur in your routes.
Be aware that providing a custom error handler for your routes will disable Express' [default error handler](https://expressjs.com/en/guide/error-handling.html).

The error handler for mapped routes is a simple function that takes 3 arguments:

```javascript
export function errorHandler(request, response, error) {
  // request is the Request object from Express
  // response is the Response object from Express
  // error is the error that was caught from the route

  console.error(error)

  response.end('An error occurred.')
}
```

## Using an interceptor

You can create an interceptor for your mapped routes which will be executed whenever a route ran successfully.

The usual use of an interceptor is to format the responses and, if necessary, to log some information. An interceptor is a function that takes 3 arguments:

```javascript
export function interceptor(request, response, content) {
  // request is the Request object from Express
  // response is the Response object from Express
  // content is the content returned by the route function

  console.log('Route executed successfully:', request.url)

  response.json({
    error: false,
    data: content
  })
}
```

Note that in order to receive `content` in your interceptor, your routes need to return some value.

# Using with Typescript

MappedRoutes is written in Typescript, so the library comes with type declarations and documentation.

Some extra types are exported to help you type your routes, such as `RouteHandler`:

```typescript
import { RouteHandler } from 'mapped-routes'

// req and res are automatically typed!
export const get: RouteHandler = (req, res) => {
  return 'My typed and mapped GET route'
}

// Typing the return type
export const post: RouteHandler = (req, res): number => {
  return 123
}

// Typing with generics
export const patch = RouteHandler<boolean> = (req, res) => {
  return true
}

// Accept Promises as well
export const put = RouteHandler<string> = async (req, res) => {
  return 'OwO'
}

```

You can also use regular functions and Express' types:

```typescript
import { Request, Response } from 'express'

// Using functions, simply use Express types
export function get(req: Request, res: Response) {
  return 'Some value'
}

// Using functions and typing the return type
export function post(req: Request, res: Response): number {
  return 123
}
```

You can type your error handler and interceptor using the `ErrorHandler` and `Interceptor` types:

```typescript
import { ErrorHandler, Interceptor } from 'mapped-routes'

// Typed error handler
export const errorHandler: ErrorHandler = (req, res, err) => {
  console.error(err)
}

// Typed interceptor
export const interceptor: Interceptor = (req, res, content) => {
  console.log(content)
}
```

# Contributions

Contributions are welcome as Issues or PR! Make sure to read the [Code of Conduct](https://github.com/purplnay/mapped-routes/blob/main/CODE_OF_CONDUCT.md).
