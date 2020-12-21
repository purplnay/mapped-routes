import { Router } from 'express'
import { createRouter } from './createRouter'
import { mapRoutes } from './mapRoutes'
import { MappedRoutesOptions } from './types'

/**
 * Map routes from a directory to create an Express router.
 *
 * @param path The absolute path to the directory containing the routes.
 * @param options A configuration object for these mapped routes.
 */
export function MappedRoutes(
  path: string,
  options?: MappedRoutesOptions,
): Router {
  const routes = mapRoutes(path)
  const { errorHandler, interceptor, middlewares } = options || {}

  return createRouter(routes, middlewares, errorHandler, interceptor)
}
