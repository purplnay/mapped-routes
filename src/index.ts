import {
  NextFunction,
  Request,
  RequestHandler,
  Response,
  Router,
} from 'express'
import { isAbsolute, normalize, join } from 'path'
import { existsSync } from 'fs'
import read from 'fs-readdir-recursive'

export type ExpressRequestHandler = RequestHandler<any, any, any, any>

/**
 * A route handler that can be synchronous or asynchronous returning a Promise.
 */
export type RouteHandler<T = any> = (
  request?: Request,
  response?: Response,
) => T | Promise<T>

/**
 * Generate Express route paths from a directory structure.
 *
 * @param dir The directory to read the routes from.
 * @returns An object with Express paths as key and module path as value.
 */
export function mapRoutes(dir: string): { [key: string]: string } {
  const dirPath = normalize(dir)

  // Reject relative paths
  if (!isAbsolute(dirPath)) {
    throw new Error(`Path \`${dir}\` is not an absolute path.`)
  }

  // Reject invalid paths
  if (!existsSync(dirPath)) {
    throw new Error(`Directory \`${dir}\` does not exist.`)
  }

  // Get the paths in `dir`
  const paths = read(dirPath)
    .map(path => {
      // Add a starting / and normalize the path
      return '/' + normalize(path)
    })
    .map(path => {
      // Replace backslashes for Windows
      return path.replace(/\\/g, '/')
    })

  const routes: { [key: string]: string } = {}

  paths.forEach(path => {
    // Remove file extensions
    const withoutExtension = path.replace(/\.m?(js|ts)x?$/i, '')

    // Remove 'index'
    const withoutIndex = withoutExtension.replace(/\/index$/i, '')

    // Transform bracket params to Express params
    const withParams = withoutIndex.replace(/\[([a-z0-9\-_]+)\]/gi, ':$1')

    routes[withParams] = join(dirPath, path).replace(/\\/g, '/')
  })

  return routes
}

/**
 * Sort routes from lowest amount of params to highest.
 *
 * @param routes The route paths to sort.
 */
export function sortByNestedParams(routes: string[]): string[] {
  return routes.sort((a, b) => {
    const aParams = a.match(/:[a-z0-9\-_]+/gi)?.length || 0
    const bParams = b.match(/:[a-z0-9\-_]+/gi)?.length || 0

    if (aParams > bParams) {
      return 1
    }

    if (bParams > aParams) {
      return -1
    }

    return 0
  })
}

/**
 * An error handler for the mapped routes.
 * Executed whenever an error occurs in one of the routes.
 */
export type ErrorHandler = (
  request?: Request,
  response?: Response,
  error?: Error | any,
) => void | Promise<void>

/**
 * An interceptor for the mapped routes.
 * Executed after a successful route.
 */
export type Interceptor = (
  request?: Request,
  response?: Response,
  content?: any,
) => void | Promise<void>

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
        response.end(result)
      }

      next()
    }
  }
}

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
      del: handler.patchMiddlewares || [],
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

/**
 * Map routes from a directory to create an Express router.
 *
 * @param path The absolute path to the directory containing the routes.
 * @param options An configuration object for these mapped routes.
 */
export function MappedRoutes(
  path: string,
  options?: MappedRoutesOptions,
): Router {
  const routes = mapRoutes(path)
  const { errorHandler, interceptor, middlewares } = options || {}

  return createRouter(routes, middlewares, errorHandler, interceptor)
}
