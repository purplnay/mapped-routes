import { Router } from 'express'
import { sortByNestedParams } from './sortByNestedParams'
import { transformHandler } from './transformHandler'
import { ErrorHandler, ExpressRequestHandler, Interceptor } from './types'

/**
 * Create an Express Router from mapped routes.
 *
 * @param routes The routes provided from `mapRoutes()`.
 * @param onError The error handler.
 * @param onSuccess The interceptor.
 */
export function createRouter(
  routes: { [key: string]: string },
  middlewares: ExpressRequestHandler[] = [],
  onError?: ErrorHandler,
  onSuccess?: Interceptor,
): Router {
  const router = Router()

  if (middlewares.length) {
    router.use(...middlewares)
  }

  // Sort the routes
  const paths = sortByNestedParams(Object.keys(routes))

  // Add the routes to the router in the sorted order
  for (let path of paths) {
    const file = routes[path]
    const handler = require(file)
    const middlewares = handler.middlewares || []
    const perMethodMiddlewares = {
      get: handler.getMiddlewares || [],
      post: handler.postMiddlewares || [],
      put: handler.putMiddlewares || [],
      patch: handler.patchMiddlewares || [],
      del: handler.delMiddlewares || [],
      head: handler.headMiddlewares || [],
      options: handler.optionsMiddlewares || [],
    }

    if (typeof handler === 'function') {
      router.all(
        path,
        ...middlewares,
        transformHandler(handler, onError, onSuccess),
      )
    } else {
      if (handler.get) {
        router.get(
          path,
          ...middlewares,
          ...perMethodMiddlewares.get,
          transformHandler(handler.get, onError, onSuccess),
        )
      }

      if (handler.post) {
        router.post(
          path,
          ...middlewares,
          ...perMethodMiddlewares.post,
          transformHandler(handler.post, onError, onSuccess),
        )
      }

      if (handler.put) {
        router.put(
          path,
          ...middlewares,
          ...perMethodMiddlewares.put,
          transformHandler(handler.put, onError, onSuccess),
        )
      }

      if (handler.patch) {
        router.patch(
          path,
          ...middlewares,
          ...perMethodMiddlewares.patch,
          transformHandler(handler.patch, onError, onSuccess),
        )
      }

      if (handler.del) {
        router.delete(
          path,
          ...middlewares,
          ...perMethodMiddlewares.del,
          transformHandler(handler.del, onError, onSuccess),
        )
      }

      if (handler.head) {
        router.head(
          path,
          ...middlewares,
          ...perMethodMiddlewares.head,
          transformHandler(handler.head, onError, onSuccess),
        )
      }

      if (handler.options) {
        router.options(
          path,
          ...middlewares,
          ...perMethodMiddlewares.options,
          transformHandler(handler.options, onError, onSuccess),
        )
      }
    }
  }

  return router
}
