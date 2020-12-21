import { NextFunction, Request, Response } from 'express'
import { ErrorHandler, Interceptor, RouteHandler } from './types'

/**
 * Transform a route handler into an Express route.
 *
 * @param handler The route handler.
 * @param onError The error handler.
 * @param onSuccess The interceptor.
 */
export function transformHandler(
  handler: RouteHandler,
  onError?: ErrorHandler,
  onSuccess?: Interceptor,
) {
  return async (request: Request, response: Response, next: NextFunction) => {
    let result: any

    try {
      result = handler(request, response)

      // Await for async handlers
      if (result instanceof Promise) {
        result = await result
      }
    } catch (error) {
      // Use custom error handler if set, or default one if not set
      if (onError) {
        onError(request, response, error)
      } else {
        next(error)
      }
    }

    // Use interceptor or send the raw result if none was set.
    if (onSuccess) {
      onSuccess(request, response, result)
    } else {
      if (result) {
        response.send(result)
        response.end()
      }

      next()
    }
  }
}
