import { NextFunction, Request, Response } from 'express'

/**
 * An Express middleware handler.
 */
export type ExpressRequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => any

/**
 * A route handler that can be synchronous or asynchronous returning a Promise.
 */
export type RouteHandler<T = any> = (
  request: Request,
  response: Response,
) => T | Promise<T>

/**
 * An error handler for the mapped routes.
 * Executed whenever an error occurs in one of the routes.
 */
export type ErrorHandler = (
  request: Request,
  response: Response,
  error?: Error | any,
) => any

/**
 * An interceptor for the mapped routes.
 * Executed after a successful route.
 */
export type Interceptor = (
  request: Request,
  response: Response,
  content: any,
) => any

/**
 * Configuration object for the set of mapped routes.
 */
export interface MappedRoutesOptions {
  /**
   * The Express middlewares to run for these routes.
   */
  middlewares?: ExpressRequestHandler[]

  /**
   * The error handler to use for these mapped routes.
   * Setting it will disable Express' default error handler for these routes.
   * The handler is executed only on errors happening inside a route handler,
   * not inside a middleware.
   */
  errorHandler?: ErrorHandler

  /**
   * The interceptor to run after a successful route.
   * It can be used to format the response, create some log, etc...
   */
  interceptor?: Interceptor
}
