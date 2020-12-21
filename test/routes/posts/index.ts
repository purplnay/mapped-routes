import { NextFunction, Request, Response } from 'express'
import { RouteHandler } from '../../../src'

// Create a 'stack' array in the request object
function testMiddleware(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  ;(request as any).stack = ['testMiddleware']
  next()
}

// Add 'getTestMiddleware' to the stack
function getTestMiddleware(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  ;(request as any).stack.push('getTestMiddleware')
  next()
}

// Add 'postTestMiddleware' to the stack
function postTestMiddleware(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  ;(request as any).stack.push('postTestMiddleware')
  next()
}

export const middlewares = [testMiddleware]

export const getMiddlewares = [getTestMiddleware]

// Add 'getRoute' to the stack and return it joined with ,
export const get: RouteHandler = req => {
  const stack = (req as any).stack

  stack.push('getRoute')

  return stack.join(',')
}

export const postMiddlewares = [postTestMiddleware]

// Add 'postRoute' to the stack and return it joined with ,
export const post: RouteHandler = req => {
  const stack = (req as any).stack

  stack.push('postRoute')

  return stack.join(',')
}
