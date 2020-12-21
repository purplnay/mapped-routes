import { Request, Response } from 'express'
import { isAbsolute, normalize, join } from 'path'
import { existsSync } from 'fs'
import read from 'fs-readdir-recursive'

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
